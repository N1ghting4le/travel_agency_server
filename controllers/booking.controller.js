const format = require("pg-format"),
    Controller = require("./base.controller");

class BookingController extends Controller {
    createBooking(body) {
        const { 
            id, userId, tourId, roomType, nutrType, startDate, endDate,
            bookingDate, totalPrice, adultsAmount, childrenAmount
        } = body;

        return [
            id, userId, tourId, roomType, nutrType, adultsAmount,
            childrenAmount, startDate, endDate, bookingDate, totalPrice
        ];
    }

    addBooking(req, res) {
        if (this.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`INSERT INTO "Booking" VALUES (%L)`, this.createBooking(req.body));

        this.manipulateQuery(query, res);
    }

    getUserBookings(req, res) {
        const query = format(`
            SELECT "Booking".id AS id, tour_id, room_type, nutrition_type, adults_amount,
            children_amount, to_json(start_date) AS start_date, to_json(end_date) AS end_date, 
            to_json(booking_date) AS booking_date, total_price, departure_city, destination_country,
            tour_title, hotel_title FROM "Booking" LEFT JOIN "Tour" ON "Booking".tour_id="Tour".id
            LEFT JOIN "Hotel" ON "Tour".hotel_id="Hotel".id WHERE user_id=%L
            ORDER BY CAST(booking_date AS date) ASC
        `, req.params.id);

        this.pool.query(query, (err, response) => {
            if (err) return this.error(err, res);

            res.send(response.rows);
        });
    }
}

const bookingController = new BookingController();

module.exports = bookingController;