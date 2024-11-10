const express = require("express"),
    authenticateToken = require("../middleware"),
    tourController = require("../controllers/tour.controller");

const router = express.Router();

router.post("/getTours", (req, res) => tourController.getToursByParams(req, res));
router.get("/get/:id", (req, res) => tourController.getTourById(req, res));
router.post("/add", authenticateToken, (req, res) => tourController.addTour(req, res));
router.patch("/edit/:id", authenticateToken, (req, res) => tourController.editTour(req, res));
router.delete("/delete/:id", authenticateToken, (req, res) => tourController.deleteTour(req, res));

module.exports = router;