const express = require("express"),
    authenticateToken = require("../middleware"),
    bookingController = require("../controllers/booking.controller");

const router = express.Router();

router.post("/add", authenticateToken, (req, res) => bookingController.addBooking(req, res));
router.get("/get/:id", (req, res) => bookingController.getUserBookings(req, res));

module.exports = router;