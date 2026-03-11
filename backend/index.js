require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ===== API ROUTES =====
app.use("/api/auth", require("./routes/auth"));
app.use("/api/assessments", require("./routes/assessments"));
app.use("/api/device", require("./routes/device"));
app.use("/api/grip", require("./routes/grip"));
app.use("/api/dashboard", require("./routes/dashboard"));

// ✅ ADMIN: ใช้ไฟล์เดียวพอ (routes/admin.js)
app.use("/api/admin", require("./routes/admin"));

// (ถ้ามีไฟล์จริงค่อยใช้)
try {
  app.use("/api/users", require("./routes/users"));
} catch {
  console.log("⚠️  ยังไม่มีไฟล์ routes/users.js ข้ามไปก่อน");
}

try {
  app.use("/api/results", require("./routes/results"));
} catch {
  console.log("⚠️  ยังไม่มีไฟล์ routes/results.js ข้ามไปก่อน");
}

app.get("/", (req, res) => res.send("Backend server is running 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));