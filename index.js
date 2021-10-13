// index.js

/**
 * Required External Modules
 */

require('dotenv').config();

const express = require("express");
const path = require("path");
const mongodb = require("mongodb");
const cors = require('cors');
const { json, urlencoded } = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workerSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const clientSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const Worker = mongoose.model('Worker', workerSchema);
const Client = mongoose.model('Client', clientSchema);

/**
 * App Variables
 */

const app = express();
const port = process.env.PORT || "8000";

/**
 * DB Configuration
 */

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

/**
 *  App Configuration
 */

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

/**
 * Routes Definitions
 */

app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const client = await Client.findOne({ username, password });

        console.log(client)

        if (!!client?._id) {
            res.render("client", { _id: client._id, username });
        } else {
            const worker = await Worker.findOne({ username, password });

            console.log(worker)

            if (!!worker?._id) {
                res.render("worker", { _id: worker._id, username });
            } else {
                res.send("User not found");

            }
        }
    } catch (error) {

    }
});

app.get("/register-client", (req, res) => {
    res.render("register-client", { title: "Register" });
});

app.post("/register-client", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { _id } = await Client.create({ username, password });

        res.render("client", { _id, username });
    } catch (error) {

    }
});

app.post("/register-worker", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { _id } = await Worker.create({ username, password });

        res.render("worker", { _id, username });
    } catch (error) {

    }
});

app.get("/register-worker", (req, res) => {
    res.render("register-worker", { title: "Register" });
});

/**
 * Server Activation
 */

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});