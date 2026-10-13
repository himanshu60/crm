const mongoose = require("mongoose");
const validator = require("validator");

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 50 },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: { validator: (value) => validator.isEmail(value), message: "Invalid email address" },
        },
        // select: false keeps the hash out of every query result unless asked for with .select("+password")
        password: { type: String, required: [true, "Password is required"], select: false },
    },
    { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
