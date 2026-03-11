import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AssessmentForm() {
  const [level, setLevel] = useState(3);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await API.post("/assessments", {
        level: Number(level),
        note: note || "",
      });

      alert(
        `บันทึกสำเร็จ\nคะแนน: ${res.data.score}\nผล: ${res.data.result}\nคำแนะนำ: ${res.data.advice}`
      );

      navigate("/history");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>ทำแบบประเมิน</h2>

      <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          ระดับอาการ (1-5)
        </label>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        >
          <option value={1}>1 - ดีมาก</option>
          <option value={2}>2 - ดี</option>
          <option value={3}>3 - ปานกลาง</option>
          <option value={4}>4 - แย่</option>
          <option value={5}>5 - แย่มาก</option>
        </select>

        <label style={{ display: "block", marginBottom: 8 }}>บันทึกเพิ่มเติม</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ใส่ได้/ไม่ใส่ก็ได้"
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 12 }}
        >
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </form>
    </div>
  );
}
