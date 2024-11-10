const format = require("pg-format"),
    jwt = require("jsonwebtoken"),
    crypto = require('crypto'),
    util = require('util'),
    Controller = require("./base.controller");

class AuthController extends Controller {
    userExistsMsg = "Пользователь с таким адресом эл. почты уже существует";
    accessDeniedMsg = "Доступ запрещён";
    userNotExistMsg = "Пользователя с таким адресом эл. почты не существует";
    wrongPasswordMsg = "Неверный пароль";

    createUser(body) {
        const { id, name, surname, email, phoneNumber, password } = body;

        return [id, email, password, name, surname, phoneNumber];
    }

    generateAccessToken(email) {
        return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: "3600s" });
    }

    async scryptHash(string, salt) {
        const saltInUse = salt || crypto.randomBytes(16).toString('hex'),
            hashBuffer = await util.promisify(crypto.scrypt)(string, saltInUse, 32);

        return `${hashBuffer.toString('hex')}:${saltInUse}`;
    }
    
    async scryptVerify(testString, hashAndSalt) {
        const [, salt] = hashAndSalt.split(':');

        return await this.scryptHash(testString, salt) === hashAndSalt; 
    }

    signUp(req, res) {
        const { email } = req.body;

        if (email === process.env.ADMIN_EMAIL) {
            return this.sendError(res, 409, this.userExistsMsg);
        }

        const query = format(`SELECT 1 FROM "User" WHERE email=%L`, email);

        this.pool.query(query, async (err, response) => {
            if (err) return this.error(err, res);

            if (response.rowCount) {
                return this.sendError(res, 409, this.userExistsMsg);
            }

            const token = this.generateAccessToken({ email }),
                password = await this.scryptHash(req.body.password),
                query = format(
                    `INSERT INTO "User" VALUES (%L)`, this.createUser({...req.body, password})
                );

            this.manipulateQuery(query, res, token);
        });
    }

    async signIn(req, res) {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL) {
            if (!await this.scryptVerify(password, process.env.ADMIN_PASSWORD)) {
                return this.sendError(res, 403, this.accessDeniedMsg);
            }

            const token = this.generateAccessToken({ email });

            return res.send({ admin: true, token });
        }

        const query = format(`SELECT * FROM "User" WHERE email=%L`, email);

        this.pool.query(query, async (err, response) => {
            if (err) return this.error(err, res);

            if (response.rowCount === 0) {
                return this.sendError(res, 401, this.userNotExistMsg);
            }

            const { password: passwordAndSalt, phone_number, ...user } = response.rows[0];

            if (!await this.scryptVerify(password, passwordAndSalt)) {
                return this.sendError(res, 403, this.wrongPasswordMsg);
            }

            const token = this.generateAccessToken({ email });

            res.send({ ...user, phoneNumber: phone_number, token });
        });
    }
}

const authController = new AuthController();

module.exports = authController;