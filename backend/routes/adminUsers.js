const router = require("express").Router();
const bcrypt = require("bcryptjs");
const adminAuth = require("../middleware/adminAuth");
const db = require("../db");

// GET /api/admin/users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT user_id, username, full_name, gender, is_active, created_at
       FROM tp_user
       ORDER BY user_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("ADMIN USERS LIST ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/admin/users  (เพิ่ม user)
router.post("/users", adminAuth, async (req, res) => {
  try {
    const { username, password, full_name, gender } = req.body || {};
    if (!username || !password) return res.status(400).json({ msg: "ต้องส่ง username และ password" });

    const exist = await db.query("SELECT user_id FROM tp_user WHERE username = ? LIMIT 1", [username]);
    if (exist.length) return res.status(400).json({ msg: "username นี้มีแล้ว" });

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO tp_user (username, password_hash, full_name, gender, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [username, hash, full_name || null, gender || null]
    );

    res.json({ msg: "เพิ่มผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error("ADMIN USERS CREATE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/users/:id (แก้ไขข้อมูล)
router.put("/users/:id", adminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { full_name, gender } = req.body || {};

    await db.query(
      `UPDATE tp_user SET full_name = ?, gender = ? WHERE user_id = ?`,
      [full_name || null, gender || null, userId]
    );

    res.json({ msg: "แก้ไขผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error("ADMIN USERS UPDATE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PATCH /api/admin/users/:id/block  (บล็อก/ปลดบล็อก)
router.patch("/users/:id/block", adminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { is_active } = req.body || {};
    if (is_active !== 0 && is_active !== 1) return res.status(400).json({ msg: "ส่ง is_active เป็น 0 หรือ 1" });

    await db.query(`UPDATE tp_user SET is_active = ? WHERE user_id = ?`, [is_active, userId]);
    res.json({ msg: is_active ? "ปลดบล็อกแล้ว" : "บล็อกแล้ว" });
  } catch (err) {
    console.error("ADMIN USERS BLOCK ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    await db.query(`DELETE FROM tp_user WHERE user_id = ?`, [userId]);
    res.json({ msg: "ลบผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error("ADMIN USERS DELETE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/admin/users/:id/history  (ประวัติ grip + assessments)
router.get("/users/:id/history", adminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const grip = await db.query(
      `SELECT grip_id, device_id, hand, grip_value, measured_at
       FROM tp_user_grip
       WHERE user_id = ?
       ORDER BY measured_at DESC
       LIMIT 50`,
      [userId]
    );

    const assessments = await db.query(
      `SELECT id, score, result, advice, note, created_at
       FROM assessments
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ grip, assessments });
  } catch (err) {
    console.error("ADMIN USER HISTORY ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/users/:id/full-update
router.put("/users/:id/full-update", adminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { username, full_name, gender, password } = req.body;

    let password_hash = null;

    if (password && password.trim() !== "") {
      const bcrypt = require("bcryptjs");
      password_hash = await bcrypt.hash(password, 10);
    }

    if (password_hash) {
      await db.query(
        `UPDATE tp_user 
         SET username=?, full_name=?, gender=?, password_hash=? 
         WHERE user_id=?`,
        [username, full_name, gender, password_hash, userId]
      );
    } else {
      await db.query(
        `UPDATE tp_user 
         SET username=?, full_name=?, gender=? 
         WHERE user_id=?`,
        [username, full_name, gender, userId]
      );
    }

    res.json({ msg: "อัปเดตข้อมูลผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error("ADMIN FULL UPDATE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// PUT /api/admin/grip/:gripId
router.put("/grip/:gripId", adminAuth, async (req, res) => {
  try {
    const gripId = Number(req.params.gripId);
    const { grip_value, hand } = req.body;

    await db.query(
      `UPDATE tp_user_grip 
       SET grip_value=?, hand=? 
       WHERE grip_id=?`,
      [grip_value, hand, gripId]
    );

    res.json({ msg: "แก้ไขค่า Grip สำเร็จ" });
  } catch (err) {
    console.error("ADMIN UPDATE GRIP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// PUT /api/admin/assessments/:id
router.put("/assessments/:id", adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { score, result, advice, note } = req.body;

    await db.query(
      `UPDATE assessments
       SET score=?, result=?, advice=?, note=?
       WHERE id=?`,
      [score, result, advice, note, id]
    );

    res.json({ msg: "แก้ไขแบบประเมินสำเร็จ" });
  } catch (err) {
    console.error("ADMIN UPDATE ASSESSMENT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;