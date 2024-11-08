const express = require("express"),
    authenticateToken = require("../middleware"),
    ReviewController = require("../controllers/review.controller");

const router = express.Router();

router.get("/get/:id", ReviewController.getTourReviews);
router.post("/add", authenticateToken, ReviewController.addReview);
router.patch("/edit", authenticateToken, ReviewController.editReview);

module.exports = router;