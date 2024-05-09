import "./styles/App.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_HOST = import.meta.env.VITE_API_HOST;

function Register() {
  const navigate = useNavigate();

  const [account, setAccount] = useState({
    email: "",
    username: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (account.password != account.confirm) {
      alert("Passwords Must Match");
      return;
    }

    const body = {
      username: account.username,
      password: account.password,
      email: account.email,
    };

    fetch(`${API_HOST}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res.emailExists) {
          const newErr = new Error("Email already has account!");
          newErr.name = "Email already has account!";
          throw newErr;
        } else {
          let confirm = confirm("Please verify your Email by clicking on the sent link!");
          if (confirm) {
            navigate("/log-in");
          }
      })
      .catch((e) => {
        if (e.name == "Email already has account!") {
          console.log("Email already Exists!");
          alert("Email already associated with account!");
        } else {
          console.log("Failed to register", e);
          alert("Registration failed, try again.");
        }
      });
  };

  return (
    <div className="register-main-div">
      <div className="register-container">
        <h1 className="register-title" style={{ textAlign: "center" }}>
          Make an Account
        </h1>
        <form className="register-form-register" onSubmit={handleSubmit}>
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
            maxLength={"9"}
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
        <Link to="/" style={{ marginTop: "40px" }}>
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default Register;
