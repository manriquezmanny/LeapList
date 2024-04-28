import { useState } from "react";

function Task(props) {
  const [userInput, setUserInput] = useState(props.taskObj.body);
  // Passes object that will be used to edit up to parent component and resets form.
  const handleSubmit = (e) => {
    e.preventDefault();
    props.handleEdit();
    props.onSubmit({
      ...props.taskObj,
      body: userInput.editInput == undefined ? userInput : userInput.editInput,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInput((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={props.toggleState ? "task active" : "task"}>
      <h3>{props.number}.</h3>
      <form className="task-form" onSubmit={handleSubmit}>
        {props.toEdit == props.taskObj.id ? (
          <label>
            Edit:
            <input
              type="text"
              className="edit-input"
              defaultValue={userInput}
              autoFocus
              name="editInput"
              onChange={handleChange}
            />
          </label>
        ) : (
          <button
            type="button"
            style={{
              textDecoration: props.taskObj.complete ? "line-through" : null,
            }}
            className="objective-text"
            onClick={props.toggleComplete}
          >
            {props.taskObj.body}
          </button>
        )}
        <div>
          {props.toEdit == props.taskObj.id ? (
            <div className="task-btns">
              <button className="save-btn">
                Save <i className="bx bx-save" onClick={handleSubmit}></i>
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={props.handleDelete}
              >
                <i className="bx bx-trash"></i>
              </button>
            </div>
          ) : (
            <div className="task-btns">
              <div>
                <button
                  type="button"
                  className="edit-btn"
                  onClick={props.handleEdit}
                >
                  Edit <i className="bx bx-edit"></i>
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={props.handleDelete}
                >
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Task;
