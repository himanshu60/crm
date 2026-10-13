const notFound = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Express 5 forwards errors thrown in async handlers here, so controllers don't need try/catch.
// Express only treats a middleware as an error handler when it has 4 params, so _req must stay.
const errorHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((e) => e.message).join(", ");
        return res.status(400).json({ message });
    }
    if (err.name === "CastError") {
        return res.status(400).json({ message: `Invalid value for ${err.path}` });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "Value";
        return res.status(409).json({ message: `${field} already exists` });
    }
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON in request body" });
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
};

module.exports = { notFound, errorHandler };
