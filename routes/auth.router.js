const express = require("express"),
    authenticateToken = require("../middleware"),
    validate = require("../validationMiddleware"),
    { checkSchema } = require("express-validator"),
    authController = require("../controllers/auth.controller");

const router = express.Router();
const basicSchema = {
    email: {
        trim: true,
        isEmpty: { errorMessage: "Email is required", negated: true, bail: true },
        isEmail: { errorMessage: "Must be a valid e-mail address", bail: true }
    },
    password: {
        trim: true,
        isEmpty: { errorMessage: "Password is required", negated: true, bail: true },
        isLength: {
            errorMessage: "Passowrd length must be between 4 and 20 characters",
            options: { min: 4, max: 20 },
            bail: true
        }
    }
};

router.post("/signIn", checkSchema(basicSchema), validate, (req, res) => authController.signIn(req, res));
router.post(
    "/signUp",
    checkSchema({
        id: {
            isEmpty: { errorMessage: "GUID is required", negated: true, bail: true },
            isUUID: { errorMessage: "Must be a valid GUID", bail: true }
        },
        ...basicSchema,
        name: {
            trim: true,
            isEmpty: { errorMessage: "Name is required", negated: true, bail: true }
        },
        surname: {
            trim: true,
            isEmpty: { errorMessage: "Surname is required", negated: true, bail: true }
        },
        phoneNumber: {
            trim: true,
            isEmpty: { errorMessage: "Phone number is required", negated: true, bail: true },
            isMobilePhone: { errorMessage: "Must be a valid phone number", bail: true }
        }
    }),
    validate,
    (req, res) => authController.signUp(req, res));
router.get("/", authenticateToken, (req, res) => authController.authorize(req, res));

module.exports = router;