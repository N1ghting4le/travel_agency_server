const format = require("pg-format"),
    Controller = require("./base.controller");

class HotelController extends Controller {
    #createHotel = (body) => {
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

    addHotel = (req, res) => {
        if (!this.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`INSERT INTO "Hotel" VALUES (%L)`, this.#createHotel(req.body));

        this.manipulateQuery(query, res);
    }

    getHotelsByCountry = async (req, res) => {
        const query = format(`
            SELECT id, hotel_title FROM "Hotel" WHERE hotel_country = %L
        `, req.params.country);

        try {
            const response = await this.pool.query(query);

            res.send(response.rows);
        } catch (e) {
            this.error(e, res);
        }
    }

    getHotelById = async (req, res) => {
        const query = format(`
            SELECT row_to_json(t) hotel FROM (SELECT * FROM "Hotel" WHERE id = %L) t
        `, req.params.id);

        try {
            const response = await this.pool.query(query);

            res.send(response.rows[0].hotel);
        } catch (e) {
            this.error(e, res);
        }
    }
}

const hotelController = new HotelController();

module.exports = hotelController;