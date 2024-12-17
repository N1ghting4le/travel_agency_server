const express = require("express"),
    authenticateToken = require("../middleware/JWTmiddleware"),
    { checkSchema } = require("express-validator"),
    { idSchema, stringSchema, intSchema, dateSchema } = require("../validationSchemas"),
    validate = require("../middleware/validationMiddleware"),
    reviewController = require("../controllers/review.controller");

const router = express.Router();
const baseSchema = {
    id: idSchema("Review id"),
    mark: intSchema("Mark", "must be integer between 1 and 5", { min: 1, max: 5 }),
    review_text: stringSchema("Review text")
};

router.get(
    "/get/:id",
    checkSchema({
        id: idSchema("Tour id")
    }),
    validate,
    (req, res) => reviewController.getTourReviews(req, res));
router.post(
    "/add",
    authenticateToken,
    checkSchema({
        ...baseSchema,
        user_id: idSchema("User id"),
        tour_id: idSchema("Tour id"),
        review_date: dateSchema("Review date"),
    }),
    validate,
    (req, res) => reviewController.addReview(req, res));
router.patch(
    "/edit",
    authenticateToken,
    checkSchema({
        ...baseSchema,
        review_user_id: idSchema("Review user id")
    }),
    validate,
    (req, res) => reviewController.editReview(req, res));

module.exports = router;