const express = require("express"),
    upload = require("../storage"),
    authenticateToken = require("../middleware"),
    hotelController = require("../controllers/hotel.controller");

const router = express.Router();

router.post("/add", authenticateToken, upload.array("photos"), (req, res) => hotelController.addHotel(req, res));
router.get("/getHotels/:country", (req, res) => hotelController.getHotelsByCountry(req, res));
router.get("/getHotel/:id", (req, res) => hotelController.getHotelById(req, res));

module.exports = router;