// Seeds a minimal admin + mentor + resource library so the app is usable
// immediately after a fresh install. Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Resource = require("../models/Resource");

async function seed() {
  await connectDB();

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

  const adminEmail = "admin@equilibrium.app";
  const mentorEmail = "mentor@equilibrium.app";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      email: adminEmail,
      passwordHash: await bcrypt.hash("ChangeMe123!", saltRounds),
      anonymousUsername: "AdminOwl",
      role: "admin",
      isVerified: true,
    });
    console.log(`Created admin: ${adminEmail} / ChangeMe123!`);
  }

  const existingMentor = await User.findOne({ email: mentorEmail });
  if (!existingMentor) {
    await User.create({
      email: mentorEmail,
      passwordHash: await bcrypt.hash("ChangeMe123!", saltRounds),
      anonymousUsername: "MentorSky",
      role: "mentor",
      isVerified: true,
      mentorProfile: { bio: "Licensed counselor, 5 years experience.", specialties: ["Anxiety", "Burnout"] },
    });
    console.log(`Created mentor: ${mentorEmail} / ChangeMe123!`);
  }

  const resourceCount = await Resource.countDocuments();
  if (resourceCount === 0) {
    await Resource.insertMany([
      { title: "Box Breathing (4-4-4-4)", type: "breathing", category: "Stress", tags: ["breathing", "quick"] },
      { title: "5-4-3-2-1 Grounding Technique", type: "meditation", category: "Anxiety", tags: ["grounding"] },
      { title: "Sleep Hygiene Basics", type: "sleep", category: "Sleep", tags: ["sleep"] },
      { title: "Understanding Burnout", type: "article", category: "Burnout", tags: ["burnout", "career"] },
      { title: "Finding a Licensed Therapist", type: "professional", category: "Professional Help", tags: ["therapy"] },
    ]);
    console.log("Seeded resource library");
  }

  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
