const pool = require("../db");

class Controller {
    #pool = pool;

    get pool() {
        return this.#pool;
    }

    sendError(res, status = 500, message = "Error executing query") {
        res.status(status).json(message);
    }

    error(err, res) {
        console.error("Error executing query", err.stack);
        this.sendError(res);
    }
    
    manipulateQuery(query, res, message = "Success") {
        this.pool.query(query, (err) => {
            if (err) this.error(err, res);
            
            res.json(message);
        });
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