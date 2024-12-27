const pool = require("../db");

class Controller {
    #pool = pool;

    get pool() {
        return this.#pool;
    }

    sendError(res, status = 500, message = "Error executing query") {
        res.status(status).send({ error: message });
    }

    error(err, res) {
        console.error("Error executing query", err.stack);
        this.sendError(res);
    }
    
    async manipulateQuery(query, res, message = "Success") {
        try {
            await this.pool.query(query);
            
            res.json(message);
        } catch (e) {
            this.error(e, res);
        }
    }

    isAdmin(user) {
        return user.email === process.env.ADMIN_EMAIL;
    }

    createSqlTextArray(arr) {
        const jsonStr = JSON.stringify(arr);

        return '{' + jsonStr.substring(1, jsonStr.length - 1) + '}';
    }
}

module.exports = Controller;