import { useState, useEffect } from "react";
import "./App.css";
import Header from "./Header";
import Task from "./Task";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

// Main app component
function App() {
  // State for current tasks to render.
  const [tasks, setTasks] = useState([]);
  // State for checking if sidebar is toggled.
  const [sidebarToggled, setSidebarToggled] = useState(false);
  // State for checking if user is logged in.
  const [loggedIn, setLoggedIn] = useState("");
  const [userLists, setUserLists] = useState([]);
  const [selectedList, setSelectedList] = useState(0);
  const [toEdit, setToEdit] = useState(0);

  // Instantiated react router.
  const navigator = useNavigate();

  // Use effect for checking if logged in at start from localStorage.
  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      setLoggedIn({
        jwt: localStorage.getItem("jwt"),
        username: localStorage.getItem("username"),
        email: localStorage.getItem("email"),
      });
      async function getData() {
        setUserLists(await getUserLists());
      }
      getData();
      setSidebarToggled(true);
    }
  }, []);

  useEffect(() => {
    getListTasks();
  }, [selectedList]);

  //// Handler Functions////
  // Handler function for deleting a task from state.
  function deleteTask(id) {
    setTasks((prevTasks) => prevTasks.filter((current) => current.id != id));
  }
  // Handler function for editing a task in state.
  function handleEdit(id) {
    setToEdit(id);
  }
  // Handle deleting a list from state.
  function handleDeletedList(id) {
    setUserLists(userLists.filter((list) => list.id != id));
  }
  // Handler function for saving an edited task in state. Edited task data passed up from child component.
  const handleSave = (editedObject) => {
    if (loggedIn) {
      const jwt = localStorage.getItem("jwt");
      const taskId = editedObject.id;
      const newText = editedObject.body;
      const listId = editedObject.list_id;

      fetch("http://localhost:5000/edit-task", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: taskId,
          newText: newText,
          listId: listId,
        }),
      })
        .then((res) => res.json())
        .then((res) =>
          res.lists.sort(
            (a, b) =>
              Date.parse(a.last_edited) - Date.parse(b.last_edited).reverse()
          )
        )
        .catch((e) => console.log("Error: ", e));
    }
    setTasks((prevTasks) =>
      prevTasks.map((current) => {
        return current.id === editedObject.id
          ? { ...current, body: editedObject.body, edit: false }
          : current;
      })
    );
    setToEdit(0);
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

    const newTaskObject = {
      list_id: selectedList,
      body: task,
      complete: false,
    };
    if (!loggedIn) {
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
        .then((res) => (newTaskObject.id = res.newId.id))
        .catch((e) => console.log("Error adding new task", e));
    }
    setTasks([...tasks, newTaskObject]);
  };
  // Handler function and PUT req to update state task completion.
  const toggleComplete = (id) => {
    if (loggedIn) {
      let task;
      let newState;
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id == id) {
          task = tasks[i];
        }
      }

      if (task.complete == 0) {
        newState = 1;
      } else {
        newState = 0;
      }

      const jwt = localStorage.getItem("jwt");

      fetch("http://localhost:5000/toggle-task", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newState: newState, taskId: task.id }),
      })
        .then((res) => res.json())
        .then((res) => console.log(res.edited))
        .catch((e) => console.log("Error editing completion state of task", e));
    }

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
  // GET req to get user lists.
  async function getUserLists() {
    const jwt = localStorage.getItem("jwt");

    const lists = await fetch("http://localhost:5000/lists", {
      method: "GET",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    })
      .then((res) => res.json())
      .then((res) => res.lists)
      .catch((e) => console.log("Error getting lists", e));

    console.log(lists);
    if (lists === 0 || lists == undefined) {
      return [];
    }
    return lists
      .sort((a, b) => Date.parse(a.last_edited) - Date.parse(b.last_edited))
      .reverse();
  }
  // DELETE req to delete task from db
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
  const getNewListFromChild = (newList) => {
    setUserLists(new Array(newList, ...userLists));
  };
  // Gets login state from child component.
  const getLoggedIn = (state) => {
    setLoggedIn(state);
  };
  // Gets task state from child component.
  const getTasks = (state) => {
    setTasks(state);
  };

  console.log(userLists);

  return (
    <div className="main-container">
      <Sidebar
        sendToggleState={getToggleState}
        sendSelectedList={getSelectedList}
        sendNewList={getNewListFromChild}
        sendLoggedIn={getLoggedIn}
        sendTasks={getTasks}
        handleLogout={handleLogout}
        handleDelete={handleDeletedList}
        toggleState={sidebarToggled}
        loggedIn={loggedIn}
        username={loggedIn.username}
        userLists={userLists}
        tasks={tasks}
        selectedList={selectedList}
      />
      <Header
        onSubmit={handleAddTask}
        toggleState={sidebarToggled}
        selectedList={selectedList}
        userLists={userLists}
      />
      {tasks.map((taskObj, index) => {
        return (
          <Task
            id={taskObj.id}
            key={index}
            number={index + 1}
            taskObj={taskObj}
            handleDelete={() => deleteTask(taskObj.id)}
            handleEdit={() => handleEdit(taskObj.id)}
            toggleComplete={() => toggleComplete(taskObj.id)}
            onSubmit={handleSave}
            toggleState={sidebarToggled}
            sendTasks={getTasks}
            loggedIn={loggedIn}
            toEdit={toEdit}
          />
        );
      })}
    </div>
  );
}

export default App;
