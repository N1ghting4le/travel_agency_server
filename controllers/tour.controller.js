const format = require("pg-format"),
    Controller = require("./base.controller");

class TourController extends Controller {
    createTour(body) {
        const { 
            id, hotelId, basePrice, destinationCountry, departureCity, descr, title, notes
        } = body;

        return [
            id, hotelId, departureCity, destinationCountry, basePrice, title, descr, notes || null
        ];
    }

    async getToursByParams(req, res) {
        const { departureCity, destinationCountry, rooms, nutrition } = req.body;
        
        const query = format(`
            SELECT "Tour".id AS id, tour_title, hotel_title, resort, base_price, destination_country,
            photos[1] AS photo, array_to_json(nutrition_types) AS nutrition_types, stars,
            array_to_json(room_types) AS room_types, COALESCE(avg(mark), 0) AS avg_mark,
            count(mark) AS amount FROM "Tour" LEFT JOIN "Hotel" ON "Tour".hotel_id="Hotel".id
            LEFT JOIN "Review" ON "Tour".id="Review".tour_id WHERE delete IS NULL AND destination_country=%L
            AND departure_city=%L GROUP BY "Tour".id, hotel_title, resort, base_price, destination_country,
            stars, nutrition_types, room_types, photos ORDER BY base_price ASC
        `, destinationCountry, departureCity);

        try {
            const response = await this.pool.query(query);

            res.send(response.rows.filter(item =>
                (!nutrition.length || item.nutrition_types.some(type => nutrition.includes(type)))
                &&
                (!rooms.length || item.room_types.some(type => rooms.includes(type)))));
        } catch (e) {
            this.error(e, res);
        }
    }

    async getTourById(req, res) {
        const query = format(`
            SELECT "Tour".id AS id, "Hotel".id AS hotel_id, departure_city, destination_country, tour_title,
            tour_descr, tour_notes, hotel_title, resort, address, hotel_descr, stars, hotel_notes, base_price,
            array_to_json(nutrition_types) AS nutrition_types, array_to_json(room_types) AS room_types,
            array_to_json(photos) AS photos FROM "Tour"
            LEFT JOIN "Hotel" ON "Tour".hotel_id="Hotel".id WHERE "Tour".id=%L
        `, req.params.id);

        try {
            const response = await this.pool.query(query);

            res.send(response.rows[0]);
        } catch (e) {
            this.error(e, res);
        }
    }

    addTour(req, res) {
        if (!this.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`INSERT INTO "Tour" VALUES (%L)`, this.createTour(req.body));

        this.manipulateQuery(query, res);
    }

    async editTour(req, res) {
        if (!this.isAdmin(req.user)) return res.sendStatus(403);

        const [, ...updatedColumns] = this.createTour(req.body), query = format(`
            UPDATE "Tour" SET hotel_id=%L, departure_city=%L, destination_country=%L,
            base_price=%L, tour_title=%L, tour_descr=%L, tour_notes=%L WHERE id=%L
        `, ...updatedColumns, req.params.id);

        try {
            await this.pool.query(query);

            this.getTourById(req, res);
        } catch (e) {
            this.error(e, res);
        }
    }

    async deleteTour(req, res) {
        if (!this.isAdmin(req.user)) return res.sendStatus(403);

        const updateQuery = format(`
            UPDATE "Tour" SET delete=true WHERE id=%L
        `, req.params.id);

        await this.pool.query(updateQuery);

        const query = `
            SELECT "Tour".id AS id FROM "Tour" LEFT JOIN "Booking" ON "Tour".id="Booking".tour_id
            WHERE delete AND user_id IS NULL
        `;

        try {
            const response = await this.pool.query(query);
            const ids = response.rows.map(({ id }) => id);
            
            if (!ids.length) return res.json("Success");

            const deleteQuery = format(`
                DELETE FROM "Review" WHERE tour_id IN (%L); DELETE FROM "Tour" WHERE id IN (%L)
            `, ids, ids);

            this.manipulateQuery(deleteQuery, res);
        } catch (e) {
            this.error(e, res);
        }
    }
}

const tourController = new TourController();

module.exports = tourController;