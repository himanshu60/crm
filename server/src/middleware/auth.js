const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const employeeAuth = async (req, res, next) => {
    // Expected header -> Authorization: Bearer <token>
    const [scheme, token] = (req.headers.authorization || "").split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Authentication token missing" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    const employee = await Employee.findById(decoded._id);
    if (!employee) {
        return res.status(401).json({ message: "Employee not found" });
    }

    req.user = employee;
    next();
};

module.exports = { employeeAuth };
