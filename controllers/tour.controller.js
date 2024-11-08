const format = require("pg-format"),
    Controller = require("./base.controller");

class TourController extends Controller {
    static createTour(body) {
        const { 
            id, hotelId, basePrice, destinationCountry, departureCity, descr, title, notes
        } = body;

        return [
            id, hotelId, departureCity, destinationCountry, basePrice, title, descr, notes || null
        ];
    }

    static getToursByParams(req, res) {
        const { departureCity, destinationCountry, rooms, nutrition } = req.body;

        const query = format(`
            SELECT "Tour".id AS id, tour_title, hotel_title, resort, base_price, destination_country,
            photos[1] AS photo, array_to_json(nutrition_types) AS nutrition_types, stars,
            array_to_json(room_types) AS room_types, COALESCE(avg(mark), 0) AS avg_mark,
            count(mark) AS amount FROM "Tour" LEFT JOIN "Hotel" ON "Tour".hotel_id="Hotel".id
            LEFT JOIN "Review" ON "Tour".id="Review".tour_id WHERE destination_country=%L
            AND departure_city=%L GROUP BY "Tour".id, hotel_title, resort, base_price, destination_country,
            stars, nutrition_types, room_types, photos ORDER BY base_price ASC
        `, destinationCountry, departureCity);

        super.pool.query(query, (err, response) => {
            if (err) return super.error(err, res);

            res.send(response.rows.filter(item => 
                (!nutrition.length || item.nutrition_types.some(type => nutrition.includes(type)))
                &&
                (!rooms.length || item.room_types.some(type => rooms.includes(type)))));
        });
    }

    static getTourById(req, res) {
        const query = format(`
            SELECT "Tour".id AS id, "Hotel".id AS hotel_id, departure_city, destination_country, tour_title,
            tour_descr, tour_notes, hotel_title, resort, address, hotel_descr, stars, hotel_notes, base_price,
            array_to_json(nutrition_types) AS nutrition_types, array_to_json(room_types) AS room_types,
            array_to_json(photos) AS photos FROM "Tour"
            LEFT JOIN "Hotel" ON "Tour".hotel_id="Hotel".id WHERE "Tour".id=%L
        `, req.params.id);

        super.pool.query(query, (err, response) => {
            if (err) return super.error(err, res);
            
            res.send(response.rows[0]);
        });
    }

    static addTour(req, res) {
        if (!super.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`INSERT INTO "Tour" VALUES (%L)`, TourController.createTour(req.body));

        super.manipulateQuery(query, res);
    }

    static editTour(req, res) {
        if (!super.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`
            DELETE FROM "Tour" WHERE id=%L;
            INSERT INTO "Tour" VALUES (%L)
        `, req.params.id, TourController.createTour(req.body));

        super.pool.query(query, (err) => {
            if (err) return super.error(err, res);

            TourController.getTourById(req, res);
        });
    }

    static deleteTour(req, res) {
        if (!super.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`DELETE FROM "Tour" WHERE id=%L`, req.params.id);

        super.manipulateQuery(query, res);
    }
}

module.exports = TourController;