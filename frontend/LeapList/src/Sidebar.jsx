import { useState, useEffect } from "react";
import List from "./List";
import { useNavigate } from "react-router-dom";
import moment from "moment";

function Sidebar(props) {
  const [toggleState, setToggleState] = useState(true);
  const [selectedList, setSelectedList] = useState(0);
  const [userLists, setUserLists] = useState(props.userLists);
  const [loggedIn, setLoggedIn] = useState("");
  const [newList, setNewList] = useState("");

  // Instanciations //
  const navigate = useNavigate();

  //// Functions ////
  // Gets user's lists
  function getUserLists() {
    const jwt = localStorage.getItem("jwt");

    fetch("http://localhost:5000/lists", {
      method: "GET",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.lists <= 0 || res.lists == undefined) {
          setUserLists([]);
        } else {
          setUserLists(res.lists);
        }
      })
      .catch((e) => console.log("Error getting lists", e));
  }
  // Gets the current user's id.
  async function getUserId() {
    if (loggedIn) {
      const jwt = localStorage.getItem("jwt");
      const username = localStorage.getItem("username");

      const userId = await fetch("http://localhost:5000/get-user-id", {
        method: "POST",
        headers: {
          authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: { username, email },
      })
        .then((res) => res.json())
        .catch((e) => console.log("Error getting user ID", e));
      return userId;
    } else {
      return 0;
    }
  }
  // Adds a list to the database and state.
  async function addList() {
    const userId = await getUserId();

    if (userId) {
      fetch("http://localhost:5000/add-user-list", {
        method: "POST",
        headers: {
          authorization: `Bearer ${jst}`,
          "Content-Type": "application/json",
        },
        body: { id: id, body: newList },
      })
        .then((res) => res.json())
        .then(console.log(res.added))
        .catch((e) => console.log("Error adding list to db: ", e));
    }
  }
  // Updates state of object that will be used to edit data.
  const handleChange = (e) => {
    const editInputValue = e.target.value;
    setNewList((prev) => {
      return { ...prev, objective: editInputValue };
    });
  };
  // Handles updating the toggleState bool value.
  function toggleSideBar() {
    setToggleState(!toggleState);
  }
  // Handles updating the currently selected List.
  function listSelected(id) {
    setSelectedList(id);
  }
  // Handle's deleted list.
  function handleDeletedList(id) {
    setUserLists(userLists.filter((list) => list.id != id));
  }
  // Handles getting user's lists state from child component
  const getUserListsFromChild = (state) => {
    setUserLists(state);
  };
  // Handles navigating to log-in page.
  const signInBtn = () => {
    navigate("/log-in");
  };
  // Handles navigating to register page.
  const registerBtn = () => {
    navigate("/register");
  };

  //// Use Effects ////
  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      setLoggedIn({
        jwt: localStorage.getItem("jwt"),
        username: localStorage.getItem("username"),
        email: localStorage.getItem("email"),
      });
      getUserLists();
    }
  }, []);
  useEffect(() => {
    props.sendLoggedIn(loggedIn);
  }, [loggedIn]);
  useEffect(() => {
    props.sendUserLists(userLists);
  }, [userLists]);
  useEffect(() => {
    props.sendSelectedList(selectedList);
  }, [selectedList]);
  useEffect(() => {
    props.sendToggleState(toggleState);
  }, [toggleState]);

  return (
    <div className={toggleState ? "sidebar active" : "sidebar"}>
      {toggleState ? (
        <div className="sidebar-header active">
          <button onClick={toggleSideBar} className="sidebar-btn active">
            <img src="/listLeapPng.png" className="logo"></img>
          </button>
          <h1 className="app-name">LeapList</h1>
        </div>
      ) : (
        <div className="sidebar-header">
          <button onClick={toggleSideBar} className="sidebar-btn">
            <img src="/listLeapPng.png" className="logo"></img>
          </button>
        </div>
      )}

      {toggleState && props.userLists.length >= 1 && (
        <div className="user-lists">
          <form className="add-list-form" onSubmit={addList}>
            <input
              onChange={handleChange}
              id="add-list-input"
              type="text"
              placeholder="Add List"
              maxLength="15"
            ></input>
            <button className="add-list-btn">Add</button>
          </form>
          {userLists.map((list, index) => {
            return (
              <List
                key={index}
                id={list.id}
                name={list.list_name}
                date={moment(list.last_edited).format("MMM DD")}
                handleClick={() => listSelected(list.id)}
                handleDeletedList={handleDeletedList}
                getUserLists={getUserListsFromChild}
                currentList={selectedList}
              ></List>
            );
          })}
        </div>
      )}
      {toggleState ? (
        props.loggedIn.jwt ? (
          <div className="account active container">
            <div className="account active">
              <button onClick={toggleSideBar} className="account-btn">
                <img src="/login.png" className="account-icon"></img>
              </button>
              <p className="username">{props.username}</p>
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
              <div className="sign-up-link"></div>
              <div className="login-link">
                <button className="sign-up-btn" onClick={registerBtn}>
                  New? Register!
                </button>
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
