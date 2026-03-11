import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * บอร์ดยิงมา: POST /api/iot/grip
 * Headers:
 *   x-api-key: <IOT_API_KEY>
 * Body JSON:
 *   { device_id, grip_value, hand, user_id(optional) }
 */
router.post("/grip", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.IOT_API_KEY) {
      return res.status(401).json({ msg: "Unauthorized device" });
    }

    const { device_id, grip_value, hand = "right", user_id = null } = req.body;

    if (!device_id || grip_value === undefined) {
      return res.status(400).json({ msg: "Missing device_id or grip_value" });
    }

    const valueNum = Number(grip_value);
    if (Number.isNaN(valueNum) || valueNum < 0) {
      return res.status(400).json({ msg: "Invalid grip_value" });
    }

    await db.query(
      "INSERT INTO grip_measurements (user_id, device_id, grip_value, hand) VALUES (?, ?, ?, ?)",
      [user_id, device_id, valueNum, hand]
    );

    res.json({ msg: "Saved", device_id, grip_value: valueNum, hand });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/** ดึงค่าล่าสุด */
router.get("/grip/latest", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM grip_measurements ORDER BY measured_at DESC, id DESC LIMIT 1"
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/** ดึงย้อนหลัง (เช่น 20 รายการล่าสุด) */
router.get("/grip/history", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 200);
    const [rows] = await db.query(
      "SELECT * FROM grip_measurements ORDER BY measured_at DESC, id DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
