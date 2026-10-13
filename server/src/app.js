const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const enquiryRoutes = require("./routes/enquiry.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/enquiries", enquiryRoutes);

// Must come after all routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;
