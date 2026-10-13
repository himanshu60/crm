require("dotenv").config({ quiet: true });
const app = require("./src/app");
const { connectDB } = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error("MONGO_URI and JWT_SECRET must be set in .env");
    }

    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
});
