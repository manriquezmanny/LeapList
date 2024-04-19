import "./App.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const body = { email: login.email, password: login.password };

    fetch("http://localhost:5000/log-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        localStorage.setItem("jwt", res.jwt);
        localStorage.setItem("username", res.username);
        navigate("/");
      })
      .catch((e) => {
        console.log("Failed to login.", e);
        alert("Login failed, try again.");
      });
  };

  return (
    <div id="register-root">
      <div className="register-container">
        <h1
          className="login-item register-title"
          style={{ textAlign: "center" }}
        >
          Log In to Account
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
            type="password"
            name="password"
            placeholder="Password"
            className="login-item login-input"
            onChange={handleChange}
          ></input>
          <div className="login-item">
            <button name="Register" className="register-btn login-item">
              Log In
            </button>
          </div>
        </form>
        <Link to="/">Return Home</Link>
      </div>
    </div>
  );
}

export default Login;
