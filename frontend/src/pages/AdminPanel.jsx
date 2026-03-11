import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    gender: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState({ grip: [], assessments: [] });

  const setField = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const apiErr = (err, fallback = "เกิดข้อผิดพลาด") => {
    console.error(err);
    setError(err?.response?.data?.msg || fallback);
  };

  const loadUsers = async () => {
    setError("");
    setLoadingUsers(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      apiErr(err, "โหลดรายชื่อผู้ใช้ไม่สำเร็จ");
    } finally {
      setLoadingUsers(false);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/admin/users", form);
      setForm({ username: "", password: "", full_name: "", gender: "" });
      await loadUsers();
    } catch (err) {
      apiErr(err, "เพิ่มผู้ใช้ไม่สำเร็จ");
    }
  };

  const openHistory = async (u) => {
    setError("");
    setSelectedUser(u);
    setHistory({ grip: [], assessments: [] });
    setHistoryLoading(true);
    try {
      const res = await API.get(`/admin/users/${u.user_id}/history`);
      setHistory({
        grip: res.data?.grip || [],
        assessments: res.data?.assessments || [],
      });
    } catch (err) {
      apiErr(err, "โหลดประวัติไม่สำเร็จ");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fullEditUser = async (u) => {
    const username = prompt("Username ใหม่", u.username);
    if (username == null) return;

    const full_name = prompt("Full name ใหม่", u.full_name || "");
    if (full_name == null) return;

    const gender = prompt("Gender ใหม่ (male/female/other)", u.gender || "");
    if (gender == null) return;

    const password = prompt("Password ใหม่ (เว้นว่างถ้าไม่เปลี่ยน)", "");
    if (password == null) return;

    setError("");
    try {
      await API.put(`/admin/users/${u.user_id}/full-update`, {
        username,
        full_name,
        gender,
        password,
      });
      await loadUsers();
    } catch (err) {
      apiErr(err, "แก้ไขผู้ใช้ไม่สำเร็จ");
    }
  };

  const toggleBlock = async (u) => {
    setError("");
    try {
      await API.patch(`/admin/users/${u.user_id}/block`, {
        is_active: u.is_active ? 0 : 1,
      });
      await loadUsers();
    } catch (err) {
      apiErr(err, "บล็อก/ปลดบล็อกไม่สำเร็จ");
    }
  };

  const deleteUser = async (u) => {
    if (!confirm(`ลบผู้ใช้ ${u.username} (id ${u.user_id}) ?`)) return;
    setError("");
    try {
      await API.delete(`/admin/users/${u.user_id}`);
      if (selectedUser?.user_id === u.user_id) {
        setSelectedUser(null);
        setHistory({ grip: [], assessments: [] });
      }
      await loadUsers();
    } catch (err) {
      apiErr(err, "ลบผู้ใช้ไม่สำเร็จ");
    }
  };

  const editGrip = async (g) => {
    const grip_value = prompt("ค่า grip_value ใหม่", String(g.grip_value));
    if (grip_value == null) return;

    const hand = prompt("hand ใหม่ (left/right)", g.hand || "right");
    if (hand == null) return;

    setError("");
    try {
      await API.put(`/admin/grip/${g.grip_id}`, {
        grip_value: Number(grip_value),
        hand,
      });
      if (selectedUser) await openHistory(selectedUser);
    } catch (err) {
      apiErr(err, "แก้ไข Grip ไม่สำเร็จ");
    }
  };

  const editAssessment = async (a) => {
    const score = prompt("score ใหม่", String(a.score));
    if (score == null) return;

    const result = prompt("result ใหม่", a.result || "");
    if (result == null) return;

    const advice = prompt("advice ใหม่", a.advice || "");
    if (advice == null) return;

    const note = prompt("note ใหม่", a.note || "");
    if (note == null) return;

    setError("");
    try {
      await API.put(`/admin/assessments/${a.id}`, {
        score: Number(score),
        result,
        advice,
        note,
      });
      if (selectedUser) await openHistory(selectedUser);
    } catch (err) {
      apiErr(err, "แก้ไขแบบประเมินไม่สำเร็จ");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Admin Panel (No Login)</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadUsers}>Refresh Users</button>
          <button onClick={() => (window.location.href = "/")}>Home</button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #f3c", background: "#fff0f6", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16, marginTop: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>เพิ่มผู้ใช้</h3>
          <form onSubmit={addUser} style={{ display: "grid", gap: 10 }}>
            <div>
              <label>username</label>
              <input value={form.username} onChange={setField("username")} style={{ width: "100%", padding: 8 }} />
            </div>
            <div>
              <label>password</label>
              <input type="password" value={form.password} onChange={setField("password")} style={{ width: "100%", padding: 8 }} />
            </div>
            <div>
              <label>full_name</label>
              <input value={form.full_name} onChange={setField("full_name")} style={{ width: "100%", padding: 8 }} />
            </div>
            <div>
              <label>gender</label>
              <input value={form.gender} onChange={setField("gender")} placeholder="male/female/other" style={{ width: "100%", padding: 8 }} />
            </div>
            <button type="submit">เพิ่มผู้ใช้</button>
          </form>
        </div>

        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>รายชื่อผู้ใช้ทั้งหมด</h3>
          {loadingUsers ? (
            <div>Loading...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th>user_id</th>
                    <th>username</th>
                    <th>full_name</th>
                    <th>gender</th>
                    <th>active</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_id}</td>
                      <td>{u.username}</td>
                      <td>{u.full_name || "-"}</td>
                      <td>{u.gender || "-"}</td>
                      <td>{u.is_active ? "yes" : "no"}</td>
                      <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => openHistory(u)}>History</button>
                        <button onClick={() => fullEditUser(u)}>Full Edit</button>
                        <button onClick={() => toggleBlock(u)}>{u.is_active ? "Block" : "Unblock"}</button>
                        <button onClick={() => deleteUser(u)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>ไม่มีผู้ใช้</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div style={{ marginTop: 16, background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>ประวัติ: {selectedUser.username} (id {selectedUser.user_id})</h3>
            <button onClick={() => openHistory(selectedUser)}>Refresh History</button>
          </div>

          {historyLoading ? (
            <div style={{ marginTop: 10 }}>Loading history...</div>
          ) : (
            <>
              <h4 style={{ marginTop: 14 }}>Grip</h4>
              <div style={{ overflowX: "auto" }}>
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th>grip_id</th><th>device_id</th><th>hand</th><th>grip_value</th><th>measured_at</th><th>edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.grip.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: "center" }}>ไม่มีข้อมูล grip</td></tr>
                    ) : (
                      history.grip.map((g) => (
                        <tr key={g.grip_id}>
                          <td>{g.grip_id}</td><td>{g.device_id}</td><td>{g.hand}</td><td>{g.grip_value}</td><td>{g.measured_at}</td>
                          <td><button onClick={() => editGrip(g)}>Edit</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <h4 style={{ marginTop: 16 }}>Assessments</h4>
              <div style={{ overflowX: "auto" }}>
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th>id</th><th>score</th><th>result</th><th>advice</th><th>note</th><th>created_at</th><th>edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.assessments.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: "center" }}>ไม่มีข้อมูลแบบประเมิน</td></tr>
                    ) : (
                      history.assessments.map((a) => (
                        <tr key={a.id}>
                          <td>{a.id}</td><td>{a.score}</td><td>{a.result}</td><td>{a.advice}</td><td>{a.note}</td><td>{a.created_at}</td>
                          <td><button onClick={() => editAssessment(a)}>Edit</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}