const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./utils/db");
const userRoutes = require("./routes/userRoutes");
// const advocateRoutes = require("./routes/advocateRoutes");
const cookieParser = require("cookie-parser");

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
// app.use("/api/advocates", advocateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
