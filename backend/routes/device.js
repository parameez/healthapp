// backend/routes/device.js
const router = require("express").Router();
const db = require("../db");

// POST /api/device/grip
// body: { user_id, device_id, value, hand }
router.post("/grip", async (req, res) => {
  try {
    const { user_id, device_id, value, hand } = req.body;

    if (!user_id || value === undefined || value === null) {
      return res.status(400).json({ msg: "ต้องส่ง user_id และ value" });
    }

    await db.query(
      `INSERT INTO tp_user_grip (user_id, device_id, grip_value, hand)
       VALUES (?, ?, ?, ?)`,
      [user_id, device_id ?? null, value, hand || "right"]
    );

    res.json({ msg: "บันทึกค่า grip สำเร็จ" });
  } catch (err) {
    console.error("DEVICE GRIP ERROR:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /api/device/grip/user/:userId
router.get("/grip/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const rows = await db.query(
      `SELECT 
        g.grip_id,
        g.user_id,
        g.device_id,
        g.hand,
        g.grip_value,
        g.measured_at,
        d.device_code,
        d.device_name
      FROM tp_user_grip g
      LEFT JOIN tp_device d ON d.device_id = g.device_id
      WHERE g.user_id = ?
      ORDER BY g.measured_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET GRIP ERROR:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
