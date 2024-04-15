import { useState, useRef } from "react";

function Header(props) {
  const [task, setTask] = useState();

  // Ref used to reset value after submission.
  const addInput = useRef(null);

  // Updates task state on input change.
  const handleChange = (e) => {
    const newTask = e.target.value;
    setTask(newTask);
  };

  // Passes state up to parent component with callback function and resets input value.
  const handleSubmit = (e) => {
    e.preventDefault();
    props.onSubmit(task);
    setTask("");
    addInput.current.value = "";
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={props.toggleState ? "header-form active" : "header-form"}
      >
        <h2 id="main-header">Current List</h2>
        <div className="header-right">
          <label classsName="input-label">
            To Do:
            <input
              id="input-field"
              onChange={handleChange}
              ref={addInput}
              type="text"
              name="objective"
            />
          </label>
          <button className="add-task-btn">Add</button>
        </div>
      </form>
    </>
  );
}

export default Header;
