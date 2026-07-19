const router = require("express").Router();
const ctrl = require("../controllers/sosController");
const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, ctrl.triggerSOS);

module.exports = router;