import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import Header from "./Header";
import Task from "./Task";
import Sidebar from "./Sidebar";

function App() {
  // State for current tasks to render.
  const [tasks, setTasks] = useState([]);
  // State for checking if sidebar is toggled.
  const [sidebarToggled, setSidebarToggled] = useState(false);
  // State for checking if user is logged in.
  const [loggedIn, setLoggedIn] = useState(false);

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

  // Handler function for adding a new task to state. Task recieved from child component with onSubmit prop.
  const handleAddTask = (task) => {
    if (!task) {
      alert("Please write a task.");
      return;
    }
    const newId = uuidv4();
    const newTaskObject = {
      id: newId,
      objective: task,
      edit: false,
      complete: false,
    };

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

  return (
    <div className="main-container">
      <Sidebar
        sendToggleState={getToggleState}
        toggleState={sidebarToggled}
        loggedIn={loggedIn}
      />

      <Header onSubmit={handleAddTask} toggleState={sidebarToggled} />
      {tasks.map((taskObj, index) => {
        return (
          <Task
            key={taskObj.id}
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
