import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("userId", res.data.userId);
      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "ล็อกอินไม่สำเร็จ");
    }
  };

  return (
    <div className="card">
      <h2 className="page-title">เข้าสู่ระบบ</h2>
      <p className="page-subtitle">กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ</p>

      <form onSubmit={submit}>
        <input
          placeholder="ชื่อผู้ใช้ (username)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="รหัสผ่าน (password)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>เข้าสู่ระบบ</button>

        <div className="form-footer">
          ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
        </div>
      </form>
    </div>
  );
}
