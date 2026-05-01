import { useNavigate } from "react-router-dom";
import { FaHome, FaSearch, FaComments, FaCog, FaUser } from "react-icons/fa";
import "./Styling/home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
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

      
      <div className="bottom-nav">
        <div className="nav-item" >
          <FaHome />
          <span>Home</span>
        </div>

        <div className="nav-item" onClick={()=>navigate("/search")}>
          <FaSearch />
          <span>Search</span>
        </div>

        <div className="nav-item" >
          <FaComments />
          <span>Chat</span>
        </div>

        <div className="nav-item" onClick={()=>navigate("/settings")}>
          <FaCog />
          <span>Settings</span>
        </div>

        <div className="nav-item">
          <FaUser />
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
}