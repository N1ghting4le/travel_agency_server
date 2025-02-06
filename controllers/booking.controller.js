const format = require("pg-format"),
    Controller = require("./base.controller");

class BookingController extends Controller {
    static #unavailableTourMsg = "Данный тур больше не доступен";
    static #bookedTourMsg = "У вас есть забронированный тур на эти даты";

    #createBooking = (body) => {
        const {
            id, userId, tourId, roomType, nutrType, startDate, endDate,
            bookingDate, totalPrice, adultsAmount, childrenAmount
        } = body;

        return [
            id, userId, tourId, roomType, nutrType, adultsAmount,
            childrenAmount, startDate, endDate, bookingDate, totalPrice
        ];
    }

    addBooking = async (req, res) => {
        if (this.isAdmin(req.user)) return res.sendStatus(403);

        const { startDate, endDate } = req.body;
        const checkTourQuery = format(`SELECT delete FROM "Tour" WHERE id = %L`, req.body.tourId);

        try {
            const response = await this.pool.query(checkTourQuery);

            if (response.rows[0].delete) {
                return this.sendError(res, 409, BookingController.#unavailableTourMsg);
            }

            const checkDatesQuery = format(`
                SELECT 1 FROM "Booking" WHERE user_id = %L AND start_date <= %L AND end_date >= %L
            `, req.user.id, endDate, startDate);

            const dateResponse = await this.pool.query(checkDatesQuery);

            if (dateResponse.rowCount) {
                return this.sendError(res, 409, BookingController.#bookedTourMsg);
            }

            const query = format(`
                INSERT INTO "Booking" VALUES (%L)
            `, this.#createBooking({ ...req.body, userId: req.user.id }));
    
            this.manipulateQuery(query, res);
        } catch (e) {
            this.error(e, res);
        }
    }

    getUserBookings = async (req, res) => {
        const deleteQuery = format(`
            DELETE FROM "Booking" WHERE user_id = %L AND start_date < CURRENT_DATE
        `, req.params.id);

        const query = format(`
            SELECT b.id AS id, tour_id, room_type, nutrition_type, adults_amount, children_amount,
            to_json(start_date) AS start_date, to_json(end_date) AS end_date, to_json(booking_date)
            AS booking_date, total_price, departure_city, destination_country, tour_title, hotel_title
            FROM "Booking" b LEFT JOIN "Tour" t ON b.tour_id = t.id LEFT JOIN "Hotel" h ON
            t.hotel_id = h.id WHERE user_id = %L ORDER BY CAST(booking_date AS date) ASC
        `, req.params.id);

        try {
            await this.pool.query(deleteQuery);

            const response = await this.pool.query(query);

            res.send(response.rows);
        } catch (e) {
            this.error(e, res);
        }
    }
}

const bookingController = new BookingController();

module.exports = bookingController;