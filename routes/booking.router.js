const express = require("express"),
    authenticateToken = require("../middleware/JWTmiddleware"),
    validate = require("../middleware/validationMiddleware"),
    { idSchema, stringSchema, dateSchema, intSchema, floatSchema } = require("../validationSchemas"),
    { checkSchema } = require("express-validator"),
    bookingController = require("../controllers/booking.controller");

const router = express.Router();

router.post(
    "/add",
    authenticateToken,
    checkSchema({
        id: idSchema("Booking id"),
        tourId: idSchema("Tour id"),
        roomType: stringSchema("Room type"),
        nutrType: stringSchema("Nutrition type"),
        startDate: dateSchema("Start date"),
        endDate: dateSchema("End date"),
        bookingDate: dateSchema("Booking date"),
        totalPrice: floatSchema("Total price", "must be positive number", { min: 0.01 }),
        adultsAmount: intSchema("Amount of adults", "must be positive integer", { min: 1 }),
        childrenAmount: intSchema("Amount of children", "must be non-negative integer", { min: 0 })
    }),
    validate,
    (req, res) => bookingController.addBooking(req, res));
router.get(
    "/get/:id",
    checkSchema({
        id: idSchema("User id")
    }),
    validate,
    (req, res) => bookingController.getUserBookings(req, res));

module.exports = router;