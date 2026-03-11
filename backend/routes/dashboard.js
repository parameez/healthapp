const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.get("/summary", auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Grip ล่าสุด
    const latestGrip = await db.query(
      "SELECT grip_value, hand, measured_at FROM tp_user_grip WHERE user_id=? ORDER BY measured_at DESC LIMIT 1",
      [userId]
    );

    // ค่าเฉลี่ย grip
    const avgGrip = await db.query(
      "SELECT AVG(grip_value) as avg FROM tp_user_grip WHERE user_id=?",
      [userId]
    );

    // ประเมินล่าสุด
    const latestAssessment = await db.query(
      "SELECT score, result, created_at FROM assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    res.json({
      latestGrip: latestGrip[0] || null,
      avgGrip: avgGrip[0]?.avg || 0,
      latestAssessment: latestAssessment[0] || null
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
