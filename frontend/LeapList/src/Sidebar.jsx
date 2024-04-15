import { useState, useEffect } from "react";
import List from "./List";

function Sidebar(props) {
  const [toggleState, setToggleState] = useState(props.toggleState);

  // Updates the toggleState bool value.
  function toggleSideBar() {
    setToggleState(!toggleState);
  }

  // Sends toggleState up to parent component using callback function.
  useEffect(() => {
    props.sendToggleState(toggleState);
  }, [toggleState]);

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
        <div className="login active">
          <div className="login active">
            <button onClick={toggleSideBar} className="login-btn">
              <img src="/login.png" className="login-icon"></img>
            </button>
            <p>Username1234!</p>
          </div>
          <div className="log-out-div">
            <button className="log-out-btn">Log Out</button>
          </div>
        </div>
      ) : (
        <div className="login">
          <button onClick={toggleSideBar} className="login-btn">
            <img src="/login.png" className="login-icon"></img>
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
