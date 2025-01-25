const format = require("pg-format"),
    jwt = require("jsonwebtoken"),
    crypto = require('crypto'),
    util = require('util'),
    Controller = require("./base.controller");

class AuthController extends Controller {
    static #userExistsMsg = "Пользователь с таким адресом эл. почты уже существует";
    static #accessDeniedMsg = "Доступ запрещён";
    static #userNotExistMsg = "Пользователя с таким адресом эл. почты не существует";
    static #wrongPasswordMsg = "Неверный пароль";

    #createUser(body) {
        const { id, name, surname, email, phoneNumber, password } = body;

        return [id, email, password, name, surname, phoneNumber];
    }

    #generateAccessToken(data) {
        return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: "3600s" });
    }

    async #scryptHash(string, salt) {
        const saltInUse = salt || crypto.randomBytes(16).toString('hex'),
            hashBuffer = await util.promisify(crypto.scrypt)(string, saltInUse, 32);

        return `${hashBuffer.toString('hex')}:${saltInUse}`;
    }
    
    async #scryptVerify(testString, hashAndSalt) {
        const [, salt] = hashAndSalt.split(':');

        return await this.#scryptHash(testString, salt) === hashAndSalt; 
    }

    async signUp(req, res) {
        const { id, email } = req.body;

        if (email === process.env.ADMIN_EMAIL) {
            return this.sendError(res, 409, AuthController.#userExistsMsg);
        }

        const query = format(`SELECT 1 FROM "User" WHERE email = %L`, email);

        try {
            const response = await this.pool.query(query);

            if (response.rowCount) {
                return this.sendError(res, 409, AuthController.#userExistsMsg);
            }

            const token = this.#generateAccessToken({ email, id }),
                password = await this.#scryptHash(req.body.password),
                insertQuery = format(`
                    INSERT INTO "User" VALUES (%L)
                `, this.#createUser({ ...req.body, password }));

            this.manipulateQuery(insertQuery, res, token);
        } catch (e) {
            this.error(e, res);
        }
    }

    async signIn(req, res) {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL) {
            if (!await this.#scryptVerify(password, process.env.ADMIN_PASSWORD)) {
                return this.sendError(res, 403, AuthController.#accessDeniedMsg);
            }

            const token = this.#generateAccessToken({ email });

            return res.send({ admin: true, token });
        }

        const query = format(`SELECT * FROM "User" WHERE email = %L`, email);

        try {
            const response = await this.pool.query(query);

            if (response.rowCount === 0) {
                return this.sendError(res, 401, AuthController.#userNotExistMsg);
            }

            const { password: passwordAndSalt, phone_number, ...user } = response.rows[0];

            if (!await this.#scryptVerify(password, passwordAndSalt)) {
                return this.sendError(res, 403, AuthController.#wrongPasswordMsg);
            }

            const token = this.#generateAccessToken({ email, id: user.id });

            res.send({ ...user, phoneNumber: phone_number, token });
        } catch (e) {
            this.error(e, res);
        }
    }

    async authorize(req, res) {
        if (this.isAdmin(req.user)) return res.send({ admin: true });

        const query = format(`SELECT * FROM "User" WHERE email = %L`, req.user.email);

        try {
            const response = await this.pool.query(query);
            const { password, phone_number, ...user } = response.rows[0];

            res.send({ ...user, phoneNumber: phone_number });
        } catch (e) {
            this.error(e, res);
        }
    }
}

const authController = new AuthController();

module.exports = authController;