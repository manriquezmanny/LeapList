import { useState, useEffect } from "react";
import List from "./List";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";

function Sidebar(props) {
  const [toggleState, setToggleState] = useState(true);
  const [selectedList, setSelectedList] = useState(0);

  // Updates the toggleState bool value.
  function toggleSideBar() {
    setToggleState(!toggleState);
  }

  // Updates Selected List.
  function listSelected(id) {
    setSelectedList(id);
  }

  // Sends toggleState up to parent component using callback function.
  useEffect(() => {
    props.sendToggleState(toggleState);
  }, [toggleState]);

  // Sends selected List up to parent component when list is selected.
  useEffect(() => {
    props.sendSelectedList(selectedList);
  }, [selectedList]);

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

      {toggleState && props.userLists.length >= 1 && (
        <div className="user-lists">
          {props.userLists.map((list, index) => {
            return (
              <List
                key={index}
                id={list.id}
                name={list.list_name}
                date={moment(list.last_edited).format("MMM DD")}
                handleClick={() => listSelected(list.id)}
              ></List>
            );
          })}
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
              <button
                className="log-out-btn"
                onClick={() => props.handleLogout()}
              >
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
