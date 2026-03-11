const router = require("express").Router();
const bcrypt = require("bcryptjs");
const db = require("../db");

// ====== GET ALL USERS ======
router.get("/users", async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT user_id, username, full_name, gender, is_blocked FROM tp_user ORDER BY user_id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("ADMIN GET USERS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ====== CREATE USER ======
router.post("/users", async (req, res) => {
  try {
    const { username, password, full_name, gender } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "ต้องส่ง username และ password" });
    }

    const exists = await db.query(
      "SELECT user_id FROM tp_user WHERE username=?",
      [username]
    );
    if (exists.length > 0) {
      return res.status(400).json({ msg: "username ซ้ำ" });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO tp_user (username, password_hash, full_name, gender, is_blocked) VALUES (?,?,?,?,1)",
      [username, hash, full_name || null, gender || null]
    );

    res.json({ msg: "created" });
  } catch (err) {
    console.error("ADMIN CREATE USER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ====== FULL UPDATE USER ======
router.put("/users/:id/full-update", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { username, full_name, gender, password } = req.body;

    if (!username) return res.status(400).json({ msg: "ต้องมี username" });

    const dup = await db.query(
      "SELECT user_id FROM tp_user WHERE username=? AND user_id<>?",
      [username, userId]
    );
    if (dup.length > 0) return res.status(400).json({ msg: "username ซ้ำ" });

    if (password && password.trim().length > 0) {
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE tp_user SET username=?, full_name=?, gender=?, password_hash=? WHERE user_id=?",
        [username, full_name || null, gender || null, hash, userId]
      );
    } else {
      await db.query(
        "UPDATE tp_user SET username=?, full_name=?, gender=? WHERE user_id=?",
        [username, full_name || null, gender || null, userId]
      );
    }

    res.json({ msg: "updated" });
  } catch (err) {
    console.error("ADMIN FULL UPDATE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ====== BLOCK/UNBLOCK ======
router.patch("/users/:id/block", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { is_blocked } = req.body;

    await db.query(
      "UPDATE tp_user SET is_blocked=? WHERE user_id=?",
      [is_blocked ? 1 : 0, userId]
    );

    res.json({ msg: "ok" });
  } catch (err) {
    console.error("ADMIN BLOCK ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ====== DELETE USER ======
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    await db.query("DELETE FROM tp_user_grip WHERE user_id=?", [userId]);
    await db.query("DELETE FROM assessments WHERE user_id=?", [userId]);
    await db.query("DELETE FROM tp_user WHERE user_id=?", [userId]);

    res.json({ msg: "deleted" });
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ====== USER HISTORY ======
router.get("/users/:id/history", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const grip = await db.query(
      "SELECT grip_id, user_id, device_id, hand, grip_value, measured_at FROM tp_user_grip WHERE user_id=? ORDER BY measured_at DESC",
      [userId]
    );

    const assessments = await db.query(
      "SELECT id, user_id, score, result, advice, note, created_at FROM assessments WHERE user_id=? ORDER BY created_at DESC",
      [userId]
    );

    res.json({ grip, assessments });
  } catch (err) {
    console.error("ADMIN HISTORY ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ====== EDIT GRIP ======
router.put("/grip/:gripId", async (req, res) => {
  try {
    const gripId = Number(req.params.gripId);
    const { grip_value, hand } = req.body;

    await db.query(
      "UPDATE tp_user_grip SET grip_value=?, hand=? WHERE grip_id=?",
      [Number(grip_value), hand || "right", gripId]
    );

    res.json({ msg: "updated" });
  } catch (err) {
    console.error("ADMIN EDIT GRIP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ====== EDIT ASSESSMENT ======
router.put("/assessments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { score, result, advice, note } = req.body;

    await db.query(
      "UPDATE assessments SET score=?, result=?, advice=?, note=? WHERE id=?",
      [Number(score), result || "", advice || "", note || "", id]
    );

    res.json({ msg: "updated" });
  } catch (err) {
    console.error("ADMIN EDIT ASSESSMENT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;