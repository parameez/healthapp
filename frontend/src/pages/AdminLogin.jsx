import { useState } from "react";
import API from "../services/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const onLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // เคลียร์ของเก่าค้าง
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin");

      const res = await API.post("/admin/login", { username, password });

      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin || {}));

      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>
      <form
        onSubmit={onLogin}
        style={{ display: "grid", gap: 10, maxWidth: 320 }}
      >
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin user"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="admin pass"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}