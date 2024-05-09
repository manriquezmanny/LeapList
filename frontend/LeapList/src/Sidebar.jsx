import { useState } from "react";
import List from "./List";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import "./styles/Sidebar.css";

function Sidebar(props) {
  const API_HOST = import.meta.env.VITE_API_HOST;

  const [newList, setNewList] = useState("");

  // Instanciations //
  const navigate = useNavigate();

  //// Functions ////
  // Adds a list to the database and state.
  const addList = async (e) => {
    e.preventDefault();
    if (!props.loggedIn) {
      alert("Please log in to make a list.");
      e.target.reset();
      return;
    }
    const jwt = localStorage.getItem("jwt");
    if (props.loggedIn) {
      if (!newList.listName) {
        alert("Please enter a name for your new list");
        return;
      }
      if (props.userLists.length < 50) {
        const newListRes = await fetch(`${API_HOST}/add-user-list`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listName: newList.listName }),
        })
          .then((res) => res.json())
          .then((res) => res.newListRes)
          .catch((e) => console.log("Error adding list to db: ", e));
        props.sendSelectedList(newListRes.id);
        props.sendNewList(newListRes);
        e.target.reset();
      } else {
        alert("List limit reached, delete lists to add new ones!");
      }
    }
  };

  // Gets a last edited time to render.
  function formatDateTimeToRender(dateTimeStr) {
    const difference = moment.duration(moment().diff(dateTimeStr));

    // Quick and dirty fix for wrong timezone with SQL database.

    if (difference.minutes() < 1) {
      return `0m`;
    } else if (difference.hours() < 1) {
      return `${difference.minutes()}m`;
    } else if (difference.days() < 1) {
      return `${difference.hours()}h`;
    } else {
      return `${difference.days()}d`;
    }
  }

  // Handles Updating state of object that will be used to edit data.
  const handleChange = (e) => {
    const editInputValue = e.target.value;
    setNewList((prev) => {
      return { ...prev, listName: editInputValue };
    });
  };
  // Handles updating the toggleState bool value.
  function toggleSideBar() {
    //setToggleState(!toggleState);
    props.sendToggleState(!props.toggleState);
  }
  // Handles updating the currently selected List.
  function listSelected(id) {
    props.sendSelectedList(id);
  }
  // Handles navigating to log-in page.
  const signInBtn = () => {
    navigate("/log-in");
  };
  // Handles navigating to register page.
  const registerBtn = () => {
    navigate("/register");
  };

  return (
    <div className={props.toggleState ? "sidebar active" : "sidebar"}>
      {props.toggleState ? (
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

      {props.toggleState && (
        <form
          className="add-list-form-empty"
          onSubmit={addList}
          style={{ marginBottom: props.userLists.length == 0 ? "auto" : null }}
        >
          <input
            onChange={handleChange}
            id="add-list-input"
            type="text"
            placeholder="Add List"
            maxLength="15"
            autoComplete="off"
          ></input>
          <button className="add-list-btn">Add</button>
        </form>
      )}

      {props.toggleState && props.userLists.length >= 1 && (
        <div className="user-lists">
          {props.userLists.map((list) => {
            return (
              <List
                key={uuidv4()}
                id={list.id}
                name={list.list_name}
                last_edited={formatDateTimeToRender(moment(list.last_edited))}
                published={moment(list.publish_date).format("MM/DD/YYYY")}
                handleClick={() => listSelected(list.id)}
                handleDeletedList={props.handleDelete}
                currentList={props.selectedList}
              ></List>
            );
          })}
        </div>
      )}
      {props.toggleState ? (
        props.loggedIn ? (
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
            <img src="../login.png" className="account-icon"></img>
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
