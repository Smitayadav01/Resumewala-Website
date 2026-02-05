const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// Save section-wise
router.put("/:userId/:section", async (req, res) => {
  const { userId, section } = req.params;

  const update = {};
  update[section] = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: update },
    { new: true, upsert: true }
  );

  res.json(profile);
});

// Get profile
router.get("/:userId", async (req, res) => {
  const profile = await Profile.findOne({ userId: req.params.userId });
  res.json(profile);
});

module.exports = router;
