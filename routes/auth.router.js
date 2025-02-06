const express = require("express"),
    authenticateToken = require("../middleware/JWTmiddleware"),
    validate = require("../middleware/validationMiddleware"),
    { idSchema, stringSchema } = require("../validationSchemas"),
    { checkSchema } = require("express-validator"),
    authController = require("../controllers/auth.controller");

const router = express.Router();
const baseSchema = {
    email: {
        ...stringSchema("Email"),
        isEmail: { errorMessage: "Must be a valid email address", bail: true }
    },
    password: {
        ...stringSchema("Password"),
        isLength: {
            errorMessage: "Passowrd length must be between 4 and 20 characters",
            options: { min: 4, max: 20 },
            bail: true
        }
    }
};

router.post(
    "/signUp",
    checkSchema({
        id: idSchema("User id"),
        ...baseSchema,
        name: stringSchema("Name"),
        surname: stringSchema("Surname"),
        phoneNumber: {
            ...stringSchema("Phone number"),
            isMobilePhone: { errorMessage: "Must be a valid phone number", bail: true }
        }
    }),
    validate,
    authController.signUp
);

router.post("/signIn", checkSchema(baseSchema), validate, authController.signIn);
router.get("/", authenticateToken, authController.authorize);

module.exports = router;