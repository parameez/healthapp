import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NavBar() {
  const nav = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    nav("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-logo">HealthCheck</div>

      {token && (
        <nav className="nav-links">
          <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard">
            Dashboard
          </Link>
          <Link className={isActive("/assessment") ? "active" : ""} to="/assessment">
            ประเมิน
          </Link>
          <Link className={isActive("/history") ? "active" : ""} to="/history">
            ประวัติ
          </Link>
        </nav>
      )}

      <div className="nav-right">
        {token ? (
          <>
            <span>👤 {username}</span>
            <button onClick={logout}>ออกจากระบบ</button>
          </>
        ) : (
          <nav className="nav-links">
            <Link className={isActive("/login") ? "active" : ""} to="/login">
              เข้าสู่ระบบ
            </Link>
            <Link className={isActive("/register") ? "active" : ""} to="/register">
              สมัครสมาชิก
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
