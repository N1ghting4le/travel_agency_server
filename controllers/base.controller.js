const pool = require("../db");

class Controller {
    static #pool = pool;

    static get pool() {
        return Controller.#pool;
    }

    static sendError(res, status = 500, message = "Error executing query") {
        res.status(status).json(message);
    }

    static error(err, res) {
        console.error("Error executing query", err.stack);
        Controller.sendError(res);
    }
    
    static manipulateQuery(query, res, message = "Success") {
        Controller.pool.query(query, (err) => {
            if (err) Controller.error(err, res);
            
            res.json(message);
        });
    }

    static isAdmin(user) {
        return user.email === process.env.ADMIN_EMAIL;
    }

    static createSqlTextArray(arr) {
        const jsonStr = JSON.stringify(arr);

        return '{' + jsonStr.substring(1, jsonStr.length - 1) + '}';
    }
}

module.exports = Controller;