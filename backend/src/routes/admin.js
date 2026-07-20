const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("admin"));

router.get("/overview", ctrl.overview);
router.get("/emotion-distribution", ctrl.emotionDistribution);
router.get("/users", ctrl.listUsers);
router.patch("/users/:id/active", ctrl.setUserActive);
router.post("/assign-mentor", ctrl.assignMentor);
router.get("/reports", ctrl.listReports);
router.patch("/reports/:id", ctrl.resolveReport);
router.get("/therapists", ctrl.listTherapists);
router.post("/therapists", ctrl.createTherapist);
router.patch("/therapists/:id", ctrl.updateTherapist);
router.delete("/therapists/:id", ctrl.deleteTherapist);
router.post("/recommend-therapist", ctrl.recommendTherapist);

module.exports = router;
