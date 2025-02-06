const format = require("pg-format"),
    Controller = require("./base.controller");

class ReviewController extends Controller {
    static #reviewLimitMsg = "За сутки можно оставить только 1 отзыв";

    #createReview = (body) => {
        const { id, user_id, tour_id, review_date, mark, review_text } = body;

        return [id, user_id, tour_id, review_date, mark, review_text];
    }

    getTourReviews = async (req, res) => {
        const query = format(`
            SELECT r.id AS id, name, surname, mark, review_text, user_id FROM "Review" r
            LEFT JOIN "User" u ON r.user_id=u.id WHERE tour_id = %L ORDER BY review_date DESC
        `, req.params.id);

        try {
            const response = await this.pool.query(query);

            res.send(response.rows);
        } catch (e) {
            this.error(e, res);
        }
    }
    
    addReview = async (req, res) => {
        if (this.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`
            SELECT review_date FROM "Review" WHERE user_id = %L ORDER BY review_date DESC LIMIT 1
        `, req.user.id);

        try {
            const lastDate = (await this.pool.query(query)).rows[0]?.review_date;

            if (lastDate && new Date() - new Date(lastDate) < 1000 * 60 * 60 * 24) {
                return this.sendError(res, 409, ReviewController.#reviewLimitMsg);
            }
            
            const insertQuery = format(`
                INSERT INTO "Review" VALUES (%L)
            `, this.#createReview({ ...req.body, user_id: req.user.id }));
    
            this.manipulateQuery(insertQuery, res);
        } catch (e) {
            this.error(e, res);
        }
    }

    editReview = (req, res) => {
        const { id, review_user_id, review_text, mark } = req.body;

        if (!this.isAdmin(req.user) && req.user.id !== review_user_id) return res.sendStatus(403);

        const query = format(`
            UPDATE "Review" SET review_text=%L, mark=%L WHERE id=%L
        `, review_text, mark, id);

        this.manipulateQuery(query, res);
    }
}

const reviewController = new ReviewController();

module.exports = reviewController;