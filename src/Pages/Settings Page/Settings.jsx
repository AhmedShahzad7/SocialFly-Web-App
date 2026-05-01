import { useNavigate } from "react-router-dom";
import {
  IoPersonOutline,
  IoHeartOutline,
  IoTimeOutline,
  IoHelpCircleOutline,
  IoLogOutOutline,
  IoSettingsOutline
} from "react-icons/io5";
import "../Styling/settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <IoPersonOutline />, label: "Profile Detail", path: "/profile" },
    { icon: <IoHeartOutline />, label: "Liked Posts", path: "/liked" },
    { icon: <IoHelpCircleOutline />, label: "About", path: "/about" },
    { icon: <IoLogOutOutline />, label: "Logout", path: "/" },
  ];

  return (
    <div className="settings-container">

      <div className="settings-header">
        <IoSettingsOutline className="header-icon" />
        <h2>Settings</h2>
      </div>

      <div className="menu-container">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="menu-item"
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}