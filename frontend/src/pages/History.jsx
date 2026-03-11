import { useEffect, useState } from "react";
import API from "../services/api";

export default function History() {
  const [gripRows, setGripRows] = useState([]);
  const [assessRows, setAssessRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ถ้าคุณเก็บ userId ใน localStorage ไว้ก็ใช้ได้
  // แต่ถ้าไม่แน่ใจ ให้เอาจาก token decode (ภายหลังค่อยทำ)
  const userId = localStorage.getItem("userId") || "10"; // ถ้าไม่มีจริงๆ ชั่วคราว

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1) Grip History (แก้ path ให้ตรงกับ backend ของคุณ)
        // ถ้าคุณใช้ /api/grip/user/:id:
        const g = await API.get(`/grip/user/${userId}`);
        setGripRows(g.data || []);

        // 2) Assessment History (ของใหม่)
        const a = await API.get(`/assessments/me`);
        setAssessRows(a.data || []);
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.msg || "โหลดประวัติไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h2>History</h2>

      <h3>Grip History</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginBottom: 24 }}>
        <thead>
          <tr>
            <th>grip_id</th>
            <th>device_id</th>
            <th>hand</th>
            <th>grip_value</th>
            <th>measured_at</th>
          </tr>
        </thead>
        <tbody>
          {gripRows.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: "center" }}>ไม่มีข้อมูล</td></tr>
          ) : (
            gripRows.map((r) => (
              <tr key={r.grip_id ?? r.id}>
                <td>{r.grip_id ?? r.id}</td>
                <td>{r.device_id}</td>
                <td>{r.hand}</td>
                <td>{r.grip_value}</td>
                <td>{r.measured_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3>Assessment History</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>id</th>
            <th>score</th>
            <th>result</th>
            <th>advice</th>
            <th>note</th>
            <th>created_at</th>
          </tr>
        </thead>
        <tbody>
          {assessRows.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: "center" }}>ไม่มีข้อมูล</td></tr>
          ) : (
            assessRows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.score}</td>
                <td>{r.result}</td>
                <td>{r.advice}</td>
                <td>{r.note}</td>
                <td>{r.created_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
