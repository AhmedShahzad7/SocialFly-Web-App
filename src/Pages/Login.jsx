import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "./Styling/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Fill all fields");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      alert("Invalid email");
      return;
    }

    try {
        console.log("LOGIN DATA:", formData);
      const res = await authService.login(formData);
      console.log("RESPONSE:", res);

        const user = res?.user;

        if (!user) {
            throw new Error("User not returned from backend");
        }
        localStorage.setItem("user", JSON.stringify(res.user));
      alert("Welcome " + res.user.email);
      navigate("/home");
    } catch (err) {
        console.log(err)
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Login Into Your Account</h1>
        <h3>Welcome Back!</h3>

        <input
          type="email"
          placeholder="Email"
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

        <button onClick={handleLogin}>Log In</button>

        <p className="forgot">Forgot Password?</p>

        <p>
          Don’t have an account?
          <span onClick={() => navigate("/signup")} > Sign Up</span>
        </p>
      </div>
    </div>
  );
}
 