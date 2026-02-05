const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect("mongodb://localhost:27017/resumewala");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/profile", require("./routes/profile"));

app.listen(5000, () => console.log("Server running on 5000"));
