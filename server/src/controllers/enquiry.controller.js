const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");

// Public form: pick only form fields, so nobody can send claimedBy and claim a lead without logging in
const createEnquiry = async (req, res) => {
    const { name, email, phone, courseInterest, message } = req.body ?? {};
    const enquiry = await Enquiry.create({ name, email, phone, courseInterest, message });

    res.status(201).json({ message: "Enquiry submitted successfully", enquiry });
};

const getPublicEnquiries = async (_req, res) => {
    const enquiries = await Enquiry.find({ claimedBy: null }).sort({ createdAt: -1 });
    res.json({ count: enquiries.length, enquiries });
};

const claimEnquiry = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({ message: "Invalid enquiry id" });
    }

    // One atomic update that only matches while the enquiry is still unclaimed,
    // so if two employees claim at the same time only one of them succeeds
    const enquiry = await Enquiry.findOneAndUpdate(
        { _id: id, claimedBy: null },
        { claimedBy: req.user._id, claimedAt: new Date() },
        { returnDocument: "after" }
    );

    if (enquiry) {
        return res.json({ message: "Enquiry claimed successfully", enquiry });
    }

    const exists = await Enquiry.exists({ _id: id });
    if (!exists) {
        return res.status(404).json({ message: "Enquiry not found" });
    }
    res.status(409).json({ message: "Enquiry already claimed" });
};

const getMyEnquiries = async (req, res) => {
    const enquiries = await Enquiry.find({ claimedBy: req.user._id }).sort({ claimedAt: -1 });
    res.json({ count: enquiries.length, enquiries });
};

module.exports = { createEnquiry, getPublicEnquiries, claimEnquiry, getMyEnquiries };
