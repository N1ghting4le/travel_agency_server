const express = require("express"),
    authenticateToken = require("../middleware"),
    reviewController = require("../controllers/review.controller");

const router = express.Router();

router.get("/get/:id", (req, res) => reviewController.getTourReviews(req, res));
router.post("/add", authenticateToken, (req, res) => reviewController.addReview(req, res));
router.patch("/edit", authenticateToken, (req, res) => reviewController.editReview(req, res));

module.exports = router;