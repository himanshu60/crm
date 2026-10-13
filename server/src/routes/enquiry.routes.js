const express = require("express");
const { employeeAuth } = require("../middleware/auth");
const {
    createEnquiry,
    getPublicEnquiries,
    claimEnquiry,
    getMyEnquiries,
} = require("../controllers/enquiry.controller");

const router = express.Router();

// Public enquiry form: no login needed
router.post("/public", createEnquiry);

// Employee only
router.get("/public", employeeAuth, getPublicEnquiries);
router.patch("/:id/claim", employeeAuth, claimEnquiry);
router.get("/private", employeeAuth, getMyEnquiries);

module.exports = router;
