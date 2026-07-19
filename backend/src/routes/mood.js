const router = require("express").Router();
const ctrl = require("../controllers/moodController");
const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, ctrl.upsertToday);
router.get("/history", requireAuth, ctrl.history);

module.exports = router;
