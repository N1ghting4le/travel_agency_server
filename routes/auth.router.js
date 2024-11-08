const express = require("express"),
    AuthController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signIn", AuthController.signIn);
router.post("/signUp", AuthController.signUp);

module.exports = router;