const router = require("express").Router();
const auth = require("../middleware/auth");
const db = require("../db");

// คำนวณ score/result/advice จาก level (1-5)
function calcAssessment(level) {
  const mapScore = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20 };
  const score = mapScore[level];

  let result = "";
  let advice = "";

  if (score >= 80) {
    result = "ปกติ";
    advice = "ดูแลสุขภาพ ออกกำลังกายสม่ำเสมอ";
  } else if (score >= 60) {
    result = "ปานกลาง";
    advice = "พักผ่อนให้เพียงพอ และติดตามอาการ";
  } else {
    result = "เสี่ยง";
    advice = "ควรพบแพทย์หรือปรึกษาผู้เชี่ยวชาญ";
  }

  return { score, result, advice };
}

// POST /api/assessments  (Frontend ส่งแค่ level + note)
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { level, note } = req.body;

    const lv = Number(level);
    if (![1, 2, 3, 4, 5].includes(lv)) {
      return res.status(400).json({ msg: "level ต้องเป็นตัวเลข 1-5" });
    }

    const { score, result, advice } = calcAssessment(lv);

    await db.query(
      "INSERT INTO assessments (user_id, score, result, advice, note, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, score, result, advice, note || ""]
    );

    return res.json({
      msg: "บันทึกแบบประเมินสำเร็จ",
      score,
      result,
      advice,
    });
  } catch (err) {
    console.error("ASSESSMENTS POST ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/assessments/me
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const rows = await db.query(
      "SELECT id, score, result, advice, note, created_at FROM assessments WHERE user_id=? ORDER BY created_at DESC",
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error("ASSESSMENTS GET ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
