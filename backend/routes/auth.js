const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

// helper
function signToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { username, password, full_name, gender } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "ต้องมี username และ password" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ msg: "รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร" });
    }

    const exist = await db.query(
      "SELECT user_id FROM tp_user WHERE username = ? LIMIT 1",
      [username]
    );

    if (exist.length > 0) {
      return res.status(409).json({ msg: "username นี้ถูกใช้แล้ว" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO tp_user
        (username, password_hash, full_name, gender, role, is_blocked)
       VALUES (?, ?, ?, ?, 'user', 0)`,
      [username, hashed, full_name || null, gender || "other"]
    );

    return res.json({ msg: "สมัครสมาชิกสำเร็จ" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "ต้องส่ง username และ password" });
    }

    const rows = await db.query(
      `SELECT user_id, username, password_hash, full_name, gender, role, is_blocked
       FROM tp_user
       WHERE username = ?
       LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ msg: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = rows[0];

    if (Number(user.is_blocked) === 1) {
      return res.status(403).json({ msg: "บัญชีถูกบล็อก" });
    }

    const ok = await bcrypt.compare(password, user.password_hash || "");
    if (!ok) {
      return res.status(401).json({ msg: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        full_name: user.full_name,
        gender: user.gender,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ================= ME (เช็ค token) =================
router.get("/me", async (req, res) => {
  try {
    const header = req.header("Authorization");
    if (!header) return res.status(401).json({ msg: "No token" });

    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const rows = await db.query(
      `SELECT user_id, username, full_name, gender, role, is_blocked
       FROM tp_user
       WHERE user_id = ?
       LIMIT 1`,
      [decoded.userId]
    );

    if (rows.length === 0) return res.status(404).json({ msg: "User not found" });

    const user = rows[0];
    return res.json({
      user: {
        userId: user.user_id,
        username: user.username,
        full_name: user.full_name,
        gender: user.gender,
        role: user.role || "user",
        is_blocked: Number(user.is_blocked),
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(401).json({ msg: "Invalid token" });
  }
});

/**
 * ================= DEV: RESET PASSWORD (กู้แอดมิน) =================
 * เปิดใช้โดยใส่ใน .env:
 * ALLOW_DEV_RESET=1
 *
 * POST /api/auth/dev-reset-password
 * body: { username, new_password, new_role? }  // new_role เช่น 'admin'
 */
router.post("/dev-reset-password", async (req, res) => {
  try {
    if (process.env.ALLOW_DEV_RESET !== "1") {
      return res.status(403).json({ msg: "Dev reset disabled" });
    }

    const { username, new_password, new_role } = req.body;

    if (!username || !new_password) {
      return res.status(400).json({ msg: "ต้องส่ง username และ new_password" });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({ msg: "รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร" });
    }

    const rows = await db.query(
      "SELECT user_id, role FROM tp_user WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: "ไม่พบผู้ใช้" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    // อัปเดตรหัสผ่าน
    await db.query(
      "UPDATE tp_user SET password_hash = ? WHERE username = ?",
      [hashed, username]
    );

    // อัปเดต role (ถ้าส่งมา)
    if (new_role) {
      await db.query(
        "UPDATE tp_user SET role = ? WHERE username = ?",
        [new_role, username]
      );
    }

    return res.json({ msg: "รีเซ็ตรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error("DEV RESET ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;