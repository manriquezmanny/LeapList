import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import Header from "./Header";
import Task from "./Task";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

function App() {
  // State for current tasks to render.
  const [tasks, setTasks] = useState([]);
  // State for checking if sidebar is toggled.
  const [sidebarToggled, setSidebarToggled] = useState(false);
  // State for checking if user is logged in.
  const [loggedIn, setLoggedIn] = useState("");
  const [userLists, setUserLists] = useState([]);
  const [selectedList, setSelectedList] = useState(0);

  const navigator = useNavigate();

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
    if (localStorage.getItem("jwt")) {
      getListTasks();
    }
  }, [selectedList]);

  // Handler function for deleting a task from state.
  function deleteTask(id) {
    setTasks((prevTasks) => prevTasks.filter((current) => current.id != id));
  }

  // Handler function for editing a task in state.
  function handleEdit(id) {
    setTasks((prevTasks) =>
      prevTasks.map((current) => {
        return current.id === id ? { ...current, edit: true } : current;
      })
    );
  }

  // Function to get user's lists
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

  // Handler callback function for saving an edited task in state. Edited task data passed up from child component.
  const handleSave = (editedObject) => {
    setTasks((prevTasks) =>
      prevTasks.map((current) => {
        return current.id === editedObject.id
          ? { ...current, objective: editedObject.objective, edit: false }
          : current;
      })
    );
  };

  function getListTasks() {
    const jwt = localStorage.getItem("jwt");

    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ list_id: selectedList }),
    })
      .then((res) => res.json())
      .then((res) => setTasks([...JSON.parse(res.tasks)]))
      .catch((e) => console.log("Error getting tasks", e.message));
  }

  // Handler function for logging out
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setUserLists([]);
    setLoggedIn("");
    setTasks([]);
    navigator("/");
  };

  // Handler function for adding a new task to state. Task recieved from child component with onSubmit prop.
  const handleAddTask = async (task) => {
    const jwt = localStorage.getItem("jwt");

    if (!task) {
      alert("Please write a task.");
      return;
    }
    const newTaskObject = {
      list_id: selectedList,
      body: task,
      complete: false,
    };

    if (loggedIn) {
      await fetch("http://localhost:5000/add", {
        method: "POST",
        headers: {
          authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTaskObject),
      })
        .then((res) => res.json())
        .then((res) => console.log(res.added))
        .catch((e) => console.log("Error adding new task", e));
    }
    setTasks([...tasks, newTaskObject]);
  };

  // Updates state to mark a task as completed or not.
  const toggleComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((current) => {
        return current.id === id
          ? { ...current, complete: !current.complete }
          : current;
      })
    );
  };

  // Gets the sidebar toggle state from child component.
  const getToggleState = (state) => {
    setSidebarToggled(state);
  };

  // Gets selected list.
  const getSelectedList = (state) => {
    setSelectedList(state);
  };

  return (
    <div className="main-container">
      <Sidebar
        sendToggleState={getToggleState}
        sendSelectedList={getSelectedList}
        handleLogout={handleLogout}
        toggleState={sidebarToggled}
        loggedIn={loggedIn}
        username={loggedIn.username}
        userLists={userLists}
      />

      <Header onSubmit={handleAddTask} toggleState={sidebarToggled} />
      {tasks.map((taskObj, index) => {
        console.log;
        return (
          <Task
            key={index}
            number={index + 1}
            taskObj={taskObj}
            handleDelete={() => deleteTask(taskObj.id)}
            handleEdit={() => handleEdit(taskObj.id)}
            toggleComplete={() => toggleComplete(taskObj.id)}
            onSubmit={handleSave}
            toggleState={sidebarToggled}
          />
        );
      })}
    </div>
  );
}

export default App;
