import "./App.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const [account, setAccount] = useState({
    email: "",
    username: "",
    password: "",
    confirm: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div id="register-root">
      <div className="register-container">
        <h1
          className="login-item register-title"
          style={{ textAlign: "center" }}
        >
          Make an Account
        </h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="login-item login-input"
            onChange={handleChange}
          ></input>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="login-item login-input"
            onChange={handleChange}
          ></input>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="login-item login-input"
            onChange={handleChange}
          ></input>
          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            className="login-item login-input"
            onChange={handleChange}
          ></input>
          <div className="login-item">
            <button name="Register" className="register-btn login-item">
              Sign Up
            </button>
          </div>
        </form>
        <Link to="/">Return Home</Link>
      </div>
    </div>
  );
}

export default Register;
