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
const nodemailer = require("nodemailer");
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
    },
    role: String
});

const clientSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: String
});

const Worker = mongoose.model('Worker', workerSchema);
const Client = mongoose.model('Client', clientSchema);

/**
 * App Variables
 */

const upload = multer({ dest: 'uploads/' });
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

app.get("/", (req, res) => { res.render("index", { title: "Home" }); });
app.get("/login", (req, res) => { res.render("login", { title: "Login" }); });
app.get("/register-client", (req, res) => { res.render("register-client", { title: "Register" }); });
app.get("/register-worker", (req, res) => { res.render("register-worker", { title: "Register" }); });
app.get("/jobs", (req, res) => { res.render("jobs", { title: "Jobs" }); });


app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const client = await Client.findOne({ username, password });

        if (!!client?._id) {
            res.render("client", { _id: client._id, username });
        } else {
            const worker = await Worker.findOne({ username, password });

            if (!!worker?._id) {
                res.render("worker", { _id: worker._id, username });
            } else {
                res.send("User not found");
            }
        }
    } catch (error) {
        res.send("User not found");
    }
});

app.post("/register-client", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { _id } = await Client.create({ username, password, role: "client" });

        res.render("client", { _id, username });
    } catch (error) {
        res.send("Client not created, probably duplicated client");
    }
});

app.post("/register-worker", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { _id } = await Worker.create({ username, password, role: "worker" });

        res.render("worker", { _id, username });
    } catch (error) {
        res.send("Worker not created, probably duplicated worker");
    }
});

app.post("/jobs", upload.single('file'), async (req, res) => {
    try {
        const { fullname } = req.body;
        const { filename } = req.file;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.FROM_EMAIL,
                pass: process.env.SENDING_EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `${fullname} | Requested an Interview`,
            text: 'Hello, I attach my CV to this email. Reach me asap. Thanks !',
            attachments: [
                {
                    filename: 'cv.pdf',
                    path: `${__dirname}/uploads/${filename}`,
                    contentType: 'application/pdf'
                }]
        });

        res.send("Application sent");
    } catch (error) {
        res.send(error.message);
    }
});


/**
 * Server Activation
 */

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});