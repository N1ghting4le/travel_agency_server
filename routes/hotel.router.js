const express = require("express"),
    upload = require("../storage"),
    authenticateToken = require("../middleware/JWTmiddleware"),
    validate = require("../middleware/validationMiddleware"),
    { stringSchema, idSchema } = require("../validationSchemas"),
    { checkSchema } = require("express-validator"),
    hotelController = require("../controllers/hotel.controller");

const router = express.Router();

router.get(
    "/getHotels/:country",
    checkSchema({
        country: stringSchema("Hotel country")
    }),
    validate,
    hotelController.getHotelsByCountry
);

router.get(
    "/getHotel/:id",
    checkSchema({
        id: idSchema("Hotel id")
    }),
    validate,
    hotelController.getHotelById
);

router.post("/add", authenticateToken, upload.array("photos"), hotelController.addHotel);

module.exports = router;