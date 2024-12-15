const express = require("express"),
    cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth.router"),
    hotelRouter = require("./routes/hotel.router"),
    tourRouter = require("./routes/tour.router"),
    bookingRouter = require("./routes/booking.router"),
    reviewRouter = require("./routes/review.router");

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/images"));

app.use("/auth", authRouter);
app.use("/hotel", hotelRouter);
app.use("/tour", tourRouter);
app.use("/booking", bookingRouter);
app.use("/review", reviewRouter);

app.listen(process.env.PORT, process.env.HOST, () => {
    console.log("Server is running");
});

module.exports = app;