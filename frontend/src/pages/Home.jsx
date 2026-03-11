import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="card">
      <h1 className="page-title">ศูนย์ความรู้สุขภาพ</h1>
      <p className="page-subtitle">
        อ่านความรู้สุขภาพเบื้องต้น และกดเข้าสู่ระบบเพื่อทำแบบประเมินสุขภาพ
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link to="/login">
          <button>เข้าสู่ระบบเพื่อทำแบบประเมิน</button>
        </Link>
        <Link to="/register">
          <button style={{ background: "#111827" }}>สมัครสมาชิก</button>
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>บทความแนะนำ</h3>

        <div className="history-item">
          <div className="history-item-header">
            <span style={{ fontWeight: 600 }}>การนอนสำคัญต่อสุขภาพอย่างไร</span>
            <span className="badge-result badge-mid">การนอน</span>
          </div>
          <p style={{ margin: 0, color: "#4b5563" }}>
            นอนให้พอ 7–9 ชั่วโมงช่วยลดความเครียด ฟื้นฟูร่างกาย และทำให้สมองทำงานดีขึ้น
          </p>
        </div>

        <div className="history-item">
          <div className="history-item-header">
            <span style={{ fontWeight: 600 }}>หลักการกินแบบง่าย ๆ เพื่อสุขภาพ</span>
            <span className="badge-result badge-mid">โภชนาการ</span>
          </div>
          <p style={{ margin: 0, color: "#4b5563" }}>
            ลดหวาน มัน เค็ม เพิ่มผักผลไม้ และดื่มน้ำให้พอในแต่ละวัน
          </p>
        </div>
      </div>
    </div>
  );
}
