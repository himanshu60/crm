const mongoose = require("mongoose");
const validator = require("validator");

const enquirySchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 100 },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            validate: { validator: (value) => validator.isEmail(value), message: "Invalid email address" },
        },
        phone: { type: String, trim: true, maxlength: 20 },
        courseInterest: { type: String, required: [true, "Course interest is required"], trim: true },
        message: { type: String, trim: true, maxlength: 500 },
        // null = public (unclaimed) enquiry, employee id = private to that employee
        claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
        claimedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Both lead lists filter by claimedBy and sort by date
enquirySchema.index({ claimedBy: 1, createdAt: -1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);
module.exports = Enquiry;
