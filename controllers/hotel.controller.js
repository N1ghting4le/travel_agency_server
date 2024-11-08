const format = require("pg-format"),
    Controller = require("./base.controller");

class HotelController extends Controller {
    static createHotel(body) {
        const { 
            id, title, resort, address, descr, nutritionTypes,
            roomTypes, stars, images, country, notes
        } = body;

        return [
            id, title, resort, address, descr, super.createSqlTextArray(nutritionTypes.split(',')),
            super.createSqlTextArray(roomTypes.split(',')), +stars,
            super.createSqlTextArray(images.split(',')), country, notes || null
        ];
    }

    static addHotel(req, res) {
        if (!super.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`INSERT INTO "Hotel" VALUES (%L)`, HotelController.createHotel(req.body));

        super.manipulateQuery(query, res);
    }

    static getHotelsByCountry(req, res) {
        const query = format(
            `SELECT id, hotel_title FROM "Hotel" WHERE hotel_country=%L`, req.params.country
        );

        super.pool.query(query, (err, response) => {
            if (err) return super.error(err, res);

            res.send(response.rows);
        });
    }

    static getHotelById(req, res) {
        const query = format(
            `SELECT row_to_json(t) "Hotel" FROM (SELECT * FROM "Hotel" WHERE id=%L) t`, req.params.id
        );

        super.pool.query(query, (err, response) => {
            if (err) return super.error(err, res);

            res.send({ ...response.rows[0].Hotel });
        });
    }
}

module.exports = HotelController;