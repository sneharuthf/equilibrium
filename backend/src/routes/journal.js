const router = require("express").Router();
const ctrl = require("../controllers/journalController");
const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, ctrl.create);
router.get("/", requireAuth, ctrl.list);
router.delete("/:id", requireAuth, ctrl.remove);

module.exports = router;
