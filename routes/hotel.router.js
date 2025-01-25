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
    (req, res) => hotelController.getHotelsByCountry(req, res)
);

router.get(
    "/getHotel/:id",
    checkSchema({
        id: idSchema("Hotel id")
    }),
    validate,
    (req, res) => hotelController.getHotelById(req, res)
);

router.post("/add", authenticateToken, upload.array("photos"), (req, res) => hotelController.addHotel(req, res));

module.exports = router;