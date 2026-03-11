const router = require("express").Router();
const db = require("../db");

// GET /api/grip/latest
// เอาค่าล่าสุดของแต่ละ user (ไว้โชว์ตารางรวม)
router.get("/latest", async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT 
        u.user_id,
        u.gender,
        g.grip_value AS handgrip_strength,
        g.hand,
        g.measured_at
      FROM tp_user u
      LEFT JOIN tp_user_grip g 
        ON g.grip_id = (
          SELECT g2.grip_id
          FROM tp_user_grip g2
          WHERE g2.user_id = u.user_id
          ORDER BY g2.measured_at DESC
          LIMIT 1
        )
      ORDER BY u.user_id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GRIP LATEST ERROR:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /api/grip/user/:userId
// รายการทั้งหมดของ user คนนั้น (ไว้ทำหน้า history)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const rows = await db.query(
      `
      SELECT 
        g.grip_id,
        g.user_id,
        g.device_id,
        g.hand,
        g.grip_value,
        g.measured_at
      FROM tp_user_grip g
      WHERE g.user_id = ?
      ORDER BY g.measured_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GRIP USER ERROR:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
