const router = require("express").Router();
const ctrl = require("../controllers/resourceController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, ctrl.list);
router.post("/", requireAuth, requireRole("admin", "mentor"), ctrl.create);
router.delete("/:id", requireAuth, requireRole("admin"), ctrl.remove);

module.exports = router;
