/**
 * @author Filippo Donati
 * @email filippo.donati@liceodongnocchi.eu
 * @create date 2023-05-07 22:02:00
 * @modify date 2023-05-08 18:40:39
 * @desc [description]
*/

const express = require("express")
const ejs = require("express")
const bodyParser = require("body-parser")
const sqlite3 = require("sqlite3").verbose()

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Ciao")
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Running on http://localhost:3000")
})