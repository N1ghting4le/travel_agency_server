const { validationResult } = require('express-validator');

function validate(req, res, next) {
    const result = validationResult(req);

    if (result.isEmpty()) {
        next();
    } else {
        res.status(400).send(result.array({ onlyFirstError: true })[0].msg);
    }
}

module.exports = validate;