const format = require("pg-format"),
    jwt = require("jsonwebtoken"),
    Controller = require("./base.controller");

class AuthController extends Controller {
    static userExistsMsg = "Пользователь с таким адресом эл. почты уже существует";
    static accessDeniedMsg = "Доступ запрещён";
    static userNotExistMsg = "Пользователя с таким адресом эл. почты не существует";
    static wrongPasswordMsg = "Неверный пароль";

    static createUser(body) {
        const { id, name, surname, email, phoneNumber, password } = body;

        return [id, email, password, name, surname, phoneNumber];
    }

    static generateAccessToken(email) {
        return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: "3600s" });
    }

    static signUp(req, res) {
        const { email } = req.body;

        if (email === process.env.ADMIN_EMAIL) {
            return super.sendError(res, 409, AuthController.userExistsMsg);
        }

        const query = format(`SELECT 1 FROM "User" WHERE email=%L`, email);

        super.pool.query(query, (err, response) => {
            if (err) return super.error(err, res);

            if (response.rowCount) {
                return super.sendError(res, 409, AuthController.userExistsMsg);
            }

            const token = AuthController.generateAccessToken({ email }),
                query = format(`INSERT INTO "User" VALUES (%L)`, AuthController.createUser(req.body));

            super.manipulateQuery(query, res, token);
        });
    }

    static signIn(req, res) {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL) {
            if (password !== process.env.ADMIN_PASSWORD) {
                return super.sendError(res, 403, AuthController.accessDeniedMsg);
            }

            const token = AuthController.generateAccessToken({ email });

            return res.send({ admin: true, token });
        }

        const query = format(`SELECT * FROM "User" WHERE email=%L`, email);

        super.pool.query(query, (err, response) => {
            if (err) return super.error(err, res);

            if (response.rowCount === 0) {
                return super.sendError(res, 401, AuthController.userNotExistMsg);
            }

            const { password: userPassword, phone_number, ...user } = response.rows[0];

            if (password !== userPassword) {
                return super.sendError(res, 403, AuthController.wrongPasswordMsg);
            }

            const token = AuthController.generateAccessToken({ email });

            res.send({ ...user, phoneNumber: phone_number, token });
        });
    }
}

module.exports = AuthController;