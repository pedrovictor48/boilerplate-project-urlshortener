require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

const linkSchema = new mongoose.Schema({
    link: String,
});

const Link = mongoose.model("link", linkSchema);

app.post("/api/shorturl", async (req, res) => {
    const { url } = req.body;
    var reg =
        /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    if (!reg.test(url)) {
        return res.json({
            error: "invalid url",
        });
    }
    //check
    console.log(url);
    const link = Link({ link: url });
    await link.save();
    return res.json({ original_url: url, short_url: link._id });
});

app.get("/api/shorturl/:short_url", (req, res) => {
    console.log(req.params.short_url);
    const _id = req.params.short_url;
    console.log(_id);
    Link.findById(_id, (err, data) => {
        if (err) {
            res.json({ error: err });
            console.log(err);
            return;
        }
        return res.redirect(data.link);
    });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
