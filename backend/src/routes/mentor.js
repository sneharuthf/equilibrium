const router = require("express").Router();
const ctrl = require("../controllers/mentorController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/assigned", requireAuth, requireRole("mentor"), ctrl.myAssignedUsers);
router.get("/insights/:userId", requireAuth, requireRole("mentor", "admin"), ctrl.userInsights);
router.get("/alerts", requireAuth, requireRole("mentor"), ctrl.alerts);
router.patch("/alerts/:id", requireAuth, requireRole("mentor"), ctrl.updateAlertStatus);

router.post("/conversations", requireAuth, ctrl.startConversation);
router.get("/conversations", requireAuth, ctrl.listConversations);
router.get("/conversations/:conversationId/messages", requireAuth, ctrl.listMessages);
router.post("/conversations/:conversationId/messages", requireAuth, ctrl.sendMessage);

module.exports = router;
