const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const createToken = (employee) =>
    jwt.sign({ _id: employee._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });

// Never send the password hash back
const toEmployeeResponse = (employee) => ({ id: employee._id, name: employee.name, email: employee.email });

const register = async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // A duplicate email hits the unique index -> errorHandler returns 409
    const employee = await Employee.create({ name, email, password: hashedPassword });

    res.status(201).json({
        message: "Employee registered successfully",
        token: createToken(employee),
        employee: toEmployeeResponse(employee),
    });
};

const login = async (req, res) => {
    const { email, password } = req.body ?? {};

    // typeof checks also block NoSQL injection like { "email": { "$ne": null } }
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email: email.trim().toLowerCase() }).select("+password");
    const isPasswordValid = employee && (await bcrypt.compare(password, employee.password));

    // Same message for unknown email and wrong password, so emails can't be guessed
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
        message: "Login successful",
        token: createToken(employee),
        employee: toEmployeeResponse(employee),
    });
};

module.exports = { register, login };
