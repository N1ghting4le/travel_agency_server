const multer = require("multer"),
    fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { country, resort, title } = req.body;

        const dest = `./images/${country}/${resort}/${title}`;

        fs.mkdir(dest, { recursive: true }, (err) => {
            if (err && err.code !== "EEXIST") {
                cb(err, dest);
            } else {
                cb(null, dest);
            }
        });
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

module.exports = upload;