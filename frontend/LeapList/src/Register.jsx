import "./App.css";
import { Link } from "react-router-dom";

function Register() {
  return (
    <div id="register-root">
      <div className="register-container">
        <h1
          className="login-item register-title"
          style={{ textAlign: "center" }}
        >
          Make an Account
        </h1>
        <form className="register-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="login-item login-input"
          ></input>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="login-item login-input"
          ></input>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="login-item login-input"
          ></input>
          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            className="login-item login-input"
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
