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
    (req, res) => tourController.getToursByParams(req, res)
);

router.get(
    "/get/:id",
    checkSchema({
        id: idSchema("Tour id")
    }),
    validate,
    (req, res) => tourController.getTourById(req, res)
);

router.post("/add", authenticateToken, (req, res) => tourController.addTour(req, res));
router.patch("/edit/:id", authenticateToken, (req, res) => tourController.editTour(req, res));
router.delete("/delete/:id", authenticateToken, (req, res) => tourController.deleteTour(req, res));

module.exports = router;