import { useState } from "react";
import "./styles/Header.css";

function Header(props) {
  const [task, setTask] = useState();

  // Updates task state on input change.
  const handleChange = (e) => {
    const newTask = e.target.value;
    setTask(newTask);
  };

  // Passes state up to parent component with callback function and resets input value.
  const handleSubmit = (e) => {
    e.preventDefault();
    props.onSubmit(task);
    e.target.reset();
    setTask("");
  };

  let listName;
  if (props.selectedList) {
    for (let i = 0; i < props.userLists.length; i++) {
      if (props.userLists[i].id == props.selectedList) {
        listName = props.userLists[i].list_name;
      }
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={props.toggleState ? "header-form active" : "header-form"}
      >
        {props.selectedList == 0 || props.userLists.length == 0 ? (
          <h2 id="main-header">New List :</h2>
        ) : (
          <h2 id="main-header">{listName} :</h2>
        )}
        <div className="input-and-button">
          <input
            id="input-field"
            onChange={handleChange}
            type="text"
            name="objective"
            autoComplete="off"
            placeholder="Add task"
          />
          <button className="add-task-btn">Add</button>
        </div>
      </form>
    </>
  );
}

export default Header;
