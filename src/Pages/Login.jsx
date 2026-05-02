import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "./Styling/login.css";


export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.login(formData);
      const user = res?.user;

      if (!user) {
        throw new Error("User data not returned from backend");
      }

      // Keep localStorage for quick UI access (like displaying the user's name)
      localStorage.setItem("user", JSON.stringify(user));

      // Attach the cookie client-side (Expires in 7 days)
      // Make sure your backend returns the ID as _id or id
      const userId = user._id || user.id; 
      document.cookie = `userId=${userId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      alert("Welcome back, " + user.email + "!");
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Login to Your Account</h1>
          <h3>Welcome Back!</h3>
        </div>

        <div className="login-form">
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <div className="login-footer">
          <p className="forgot-password">Forgot Password?</p>
          <p className="signup-prompt">
            Don’t have an account? 
            <span onClick={() => navigate("/signup")}> Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
}