import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles/loginRegister.css";

function Login() {
  const API_HOST = import.meta.env.VITE_API_HOST;
  console.log(API_HOST);

  const navigate = useNavigate();

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const body = { email: login.email, password: login.password };

    fetch(`${API_HOST}/log-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.email) {
          throw new Error("Email not in database");
        }
        localStorage.setItem("jwt", res.jwt);
        localStorage.setItem("username", res.username);
        localStorage.setItem("email", res.email);
        navigate("/");
      })
      .catch((e) => {
        if (e.message == "Email not in database") {
          alert("Email not in database, try again");
        } else {
          console.log("Failed to login.", e);
          alert("Login failed, try again.");
        }
      });
  };

  return (
    <div id="root">
      <div className="register-main-div">
        <div className="register-container">
          <h1 className="register-title" style={{ textAlign: "center" }}>
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
          <Link to="/" style={{ marginTop: "20px" }}>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
