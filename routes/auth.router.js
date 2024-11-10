const express = require("express"),
    authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signIn", (req, res) => authController.signIn(req, res));
router.post("/signUp", (req, res) => authController.signUp(req, res));

module.exports = router;