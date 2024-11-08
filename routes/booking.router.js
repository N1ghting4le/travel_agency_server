const express = require("express"),
    authenticateToken = require("../middleware"),
    BookingController = require("../controllers/booking.controller");

const router = express.Router();

router.post("/add", authenticateToken, BookingController.addBooking);
router.get("/get/:id", BookingController.getUserBookings);

module.exports = router;