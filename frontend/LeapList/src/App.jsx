import { useState, useEffect } from "react";
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

  // Instantiated react router.
  const navigator = useNavigate();

  // Use effect for updating tasks list.
  useEffect(() => {
    if (localStorage.getItem("jwt") && selectedList != 0) {
      getListTasks();
    }
  }, [selectedList]);

  //// Handler Functions////

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
  // Handler function for saving an edited task in state. Edited task data passed up from child component.
  const handleSave = (editedObject) => {
    setTasks((prevTasks) =>
      prevTasks.map((current) => {
        return current.id === editedObject.id
          ? { ...current, objective: editedObject.objective, edit: false }
          : current;
      })
    );
  };
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

    console.log(selectedList.id);

    const newTaskObject = {
      list_id: selectedList,
      body: task,
      complete: false,
    };
    if (selectedList == 0 || !loggedIn) {
      newTaskObject.id = tasks.length + 1;
    }

    if (selectedList) {
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
    newTaskObject.id = tasks.length + 1;

    setTasks([...tasks, newTaskObject]);
  };
  // Handler function to update state of sidebar toggle.
  const toggleComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((current) => {
        return current.id === id
          ? { ...current, complete: !current.complete }
          : current;
      })
    );
  };

  // POST req to db for getting list of tasks
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

  function deleteTask(taskId) {
    const jwt = localStorage.getItem("jwt");
    if (confirm("Are you sure you want to delete this task?") == true) {
      fetch("http://localhost:5000/delete-task", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: taskId }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res.deleted);
        })
        .catch((e) => console.log("Error deleting list: ", e));
    }
    setTasks((prevTasks) =>
      prevTasks.filter((current) => current.id != taskId)
    );
  }

  // Gets the sidebar toggle state from child component.
  const getToggleState = (state) => {
    setSidebarToggled(state);
  };
  // Gets currently selected list from child component.
  const getSelectedList = (state) => {
    setSelectedList(state);
  };
  // Gets user's lists from child component.
  const getUserListsFromChild = (state) => {
    setUserLists(state);
  };
  // Gets login state from child component.
  const getLoggedIn = (state) => {
    setLoggedIn(state);
  };
  const getTasks = (state) => {
    setTasks(state);
  };

  return (
    <div className="main-container">
      <Sidebar
        sendToggleState={getToggleState}
        sendSelectedList={getSelectedList}
        sendUserLists={getUserListsFromChild}
        sendLoggedIn={getLoggedIn}
        handleLogout={handleLogout}
        toggleState={sidebarToggled}
        loggedIn={loggedIn}
        username={loggedIn.username}
        userLists={userLists}
      />

      <Header onSubmit={handleAddTask} toggleState={sidebarToggled} />
      {tasks.map((taskObj, index) => {
        return (
          <Task
            id={index}
            key={index}
            number={index + 1}
            taskObj={taskObj}
            handleDelete={() => deleteTask(taskObj.id)}
            handleEdit={() => handleEdit(taskObj.id)}
            toggleComplete={() => toggleComplete(taskObj.id)}
            onSubmit={handleSave}
            toggleState={sidebarToggled}
            sendTasks={getTasks}
          />
        );
      })}
    </div>
  );
}

export default App;
