const express = require("express"),
    upload = require("../storage"),
    authenticateToken = require("../middleware"),
    HotelController = require("../controllers/hotel.controller");

const router = express.Router();

router.post("/add", authenticateToken, upload.array("photos"), HotelController.addHotel);
router.get("/getHotels/:country", HotelController.getHotelsByCountry);
router.get("/getHotel/:id", HotelController.getHotelById);

module.exports = router;