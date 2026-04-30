import { useNavigate } from "react-router-dom";
import "./Styling/home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // just clear anything if you later add auth
    alert("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>🎉 Login Successful!</h1>
        <p>Welcome to SocialFly Web App 🚀</p>

        <div className="status-box">
          <p>✔ Frontend working</p>
          <p>✔ Login navigation successful</p>
          <p>✔ Home page loaded</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}