const format = require("pg-format"),
    Controller = require("./base.controller");

class HotelController extends Controller {
    createHotel(body) {
        const { 
            id, title, resort, address, descr, nutritionTypes,
            roomTypes, stars, images, country, notes
        } = body;

        return [
            id, title, resort, address, descr, this.createSqlTextArray(nutritionTypes.split(',')),
            this.createSqlTextArray(roomTypes.split(',')), +stars,
            this.createSqlTextArray(images.split(',')), country, notes || null
        ];
    }

    addHotel(req, res) {
        if (!this.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`INSERT INTO "Hotel" VALUES (%L)`, this.createHotel(req.body));

        this.manipulateQuery(query, res);
    }

    getHotelsByCountry(req, res) {
        const query = format(
            `SELECT id, hotel_title FROM "Hotel" WHERE hotel_country=%L`, req.params.country
        );

        this.pool.query(query, (err, response) => {
            if (err) return this.error(err, res);

            res.send(response.rows);
        });
    }

    getHotelById(req, res) {
        const query = format(
            `SELECT row_to_json(t) "Hotel" FROM (SELECT * FROM "Hotel" WHERE id=%L) t`, req.params.id
        );

        this.pool.query(query, (err, response) => {
            if (err) return this.error(err, res);

            res.send({ ...response.rows[0].Hotel });
        });
    }
}

const hotelController = new HotelController();

module.exports = hotelController;