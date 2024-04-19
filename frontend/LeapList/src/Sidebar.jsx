import { useState, useEffect } from "react";
import List from "./List";
import { Link, useNavigate } from "react-router-dom";

function Sidebar(props) {
  const [toggleState, setToggleState] = useState(true);

  // Updates the toggleState bool value.
  function toggleSideBar() {
    setToggleState(!toggleState);
  }

  // Sends toggleState up to parent component using callback function.
  useEffect(() => {
    props.sendToggleState(toggleState);
  }, [toggleState]);

  const navigate = useNavigate();

  const signInBtn = () => {
    navigate("/log-in");
  };

  return (
    <div className={toggleState ? "sidebar active" : "sidebar"}>
      {toggleState ? (
        <div className="sidebar-header active">
          <button onClick={toggleSideBar} className="sidebar-btn active">
            <img src="/listLeap.png" className="logo"></img>
          </button>
          <h1 className="app-name">LeapList</h1>
        </div>
      ) : (
        <div className="sidebar-header">
          <button onClick={toggleSideBar} className="sidebar-btn">
            <img src="/listLeap.png" className="logo"></img>
          </button>
        </div>
      )}

      {toggleState && (
        <div className="user-lists">
          <List name="Current List" date="01/03/2024"></List>
          <List name="Other List" date="01/03/2024"></List>
          <List name="Third List" date="01/03/2024"></List>
        </div>
      )}
      {toggleState ? (
        props.loggedIn.jwt ? (
          <div className="account active">
            <div className="account active">
              <button onClick={toggleSideBar} className="account-btn">
                <img src="/login.png" className="account-icon"></img>
              </button>
              <p>{props.username}</p>
            </div>
            <div className="log-out-div">
              <button className="log-out-btn" onClick={props.handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <div className="login active container">
            <div className="login active">
              <button onClick={toggleSideBar} className="account-btn">
                <img src="/login.png" className="account-icon"></img>
              </button>
              <div className="sign-up-link">
                <p className="new-user">New User?</p>
                <Link to="/register">Sign-Up</Link>
              </div>
              <div className="login-link">
                <button className="log-in-btn" onClick={signInBtn}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="account">
          <button onClick={toggleSideBar} className="account-btn">
            <img src="/login.png" className="account-icon"></img>
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
