const router = require("express").Router();
const ctrl = require("../controllers/blockController");
const { requireAuth } = require("../middleware/auth");

router.get("/blocked", requireAuth, ctrl.listBlocked);
router.post("/:userId/block", requireAuth, ctrl.blockUser);
router.post("/:userId/unblock", requireAuth, ctrl.unblockUser);

module.exports = router;