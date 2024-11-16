const express = require("express"),
    authenticateToken = require("../middleware"),
    authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signIn", (req, res) => authController.signIn(req, res));
router.post("/signUp", (req, res) => authController.signUp(req, res));
router.get("/", authenticateToken, (req, res) => authController.authorize(req, res));

module.exports = router;