const format = require("pg-format"),
    Controller = require("./base.controller");

class ReviewController extends Controller {
    createReview(body) {
        const { id, user_id, tour_id, review_date, mark, review_text } = body;

        return [id, user_id, tour_id, review_date, mark, review_text];
    }

    getTourReviews(req, res) {
        const query = format(`
            SELECT "Review".id AS id, name, surname, mark, review_text, user_id FROM "Review"
            LEFT JOIN "User" ON "Review".user_id="User".id
            WHERE tour_id=%L ORDER BY review_date DESC
        `, req.params.id);

        this.pool.query(query, (err, response) => {
            if (err) return this.error(err, res);

            res.send(response.rows);
        });
    }
    
    addReview(req, res) {
        if (this.isAdmin(req.user)) return res.sendStatus(403);

        const query = format(`INSERT INTO "Review" VALUES (%L)`, this.createReview(req.body));

        this.manipulateQuery(query, res);
    }

    editReview(req, res) {
        const { id, user_id, review_user_id, review_text, mark } = req.body;

        if (!this.isAdmin(req.user) && user_id !== review_user_id) return res.sendStatus(403);

        const query = format(
            `UPDATE "Review" SET review_text=%L, mark=%L WHERE id=%L`, review_text, mark, id
        );

        this.manipulateQuery(query, res);
    }
}

const reviewController = new ReviewController();

module.exports = reviewController;