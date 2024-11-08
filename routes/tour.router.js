const express = require("express"),
    authenticateToken = require("../middleware"),
    TourController = require("../controllers/tour.controller");

const router = express.Router();

router.post("/getTours", TourController.getToursByParams);
router.get("/get/:id", TourController.getTourById);
router.post("/add", authenticateToken, TourController.addTour);
router.patch("/edit/:id", authenticateToken, TourController.editTour);
router.delete("/delete/:id", authenticateToken, TourController.deleteTour);

module.exports = router;