import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", fullname: "", email: "" });
  const nav = useNavigate();
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("สมัครสำเร็จ");
      nav("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "สมัครไม่สำเร็จ");
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <h2>สมัครสมาชิก</h2>
      <input name="username" placeholder="username" value={form.username} onChange={onChange} />
      <input name="password" placeholder="password" type="password" value={form.password} onChange={onChange} />
      <input name="fullname" placeholder="ชื่อ-สกุล (ไม่บังคับ)" value={form.fullname} onChange={onChange} />
      <input name="email" placeholder="อีเมล (ไม่บังคับ)" value={form.email} onChange={onChange} />
      <button>สมัครสมาชิก</button>
      <div>มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link></div>
    </form>
  );
}
