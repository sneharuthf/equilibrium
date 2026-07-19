const router = require("express").Router();
const ctrl = require("../controllers/postController");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, ctrl.listFeed);
router.post("/", requireAuth, ctrl.createPost);
router.get("/:id", requireAuth, ctrl.getPost);
router.post("/:id/like", requireAuth, ctrl.likePost);
router.get("/:id/comments", requireAuth, ctrl.listComments);
router.post("/:id/comments", requireAuth, ctrl.addComment);
router.post("/report", requireAuth, ctrl.reportContent);

module.exports = router;
