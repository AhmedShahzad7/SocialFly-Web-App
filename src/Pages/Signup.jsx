import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "./Styling/signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmpass: "",
  });

  const handleSignup = async () => {
    const { fullname, username, email, password, confirmpass } = formData;

    if (!fullname || !username || !email || !password || !confirmpass) {
      alert("Fill all fields");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Invalid email");
      return;
    }

    if (password !== confirmpass) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await authService.signup(formData);
      alert("Account created successfully!");
      navigate("/");
    } catch (err) {
      console.log(err);
      console.log(err.response);
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Join SocialFly</h1>
          <h3>Stay Connected, Stay Social</h3>
        </div>

        <div className="signup-form">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

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

          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmpass}
            onChange={(e) =>
              setFormData({ ...formData, confirmpass: e.target.value })
            }
          />

          <button onClick={handleSignup} disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </div>

        <div className="signup-footer">
          <p className="login-prompt">
            Already have an account?
            <span onClick={() => navigate("/")}> Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
}