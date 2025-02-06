const express = require("express"),
    authenticateToken = require("../middleware/JWTmiddleware"),
    validate = require("../middleware/validationMiddleware"),
    { stringSchema, arraySchema, idSchema } = require("../validationSchemas"),
    { checkSchema } = require("express-validator"),
    tourController = require("../controllers/tour.controller");

const router = express.Router();

router.post(
    "/getTours",
    checkSchema({
        departureCity: stringSchema("Departure city"),
        destinationCountry: stringSchema("Destination country"),
        rooms: arraySchema("Room types", "must be array with max length of 10", {
            max: 10
        }),
        "rooms.*": stringSchema("Rooms item"),
        nutrition: arraySchema("Nutrition types", "must be array with max length of 10", {
            max: 10
        }),
        "nutrition.*": stringSchema("Nutrition item")
    }),
    validate,
    tourController.getToursByParams
);

router.get(
    "/get/:id",
    checkSchema({
        id: idSchema("Tour id")
    }),
    validate,
    tourController.getTourById
);

router.post("/add", authenticateToken, tourController.addTour);
router.patch("/edit/:id", authenticateToken, tourController.editTour);
router.delete("/delete/:id", authenticateToken, tourController.deleteTour);

module.exports = router;