function Task(props) {
  // Passes object that will be used to edit up to parent component and resets form.
  const handleSubmit = (e) => {
    e.preventDefault();
    props.handleEdit();
    const formData = new FormData(e.target);
    const editedText = formData.get("edit-input");
    props.onSubmit({ ...props.taskObj, body: editedText });
    e.target.reset();
  };

  return (
    <div className={props.toggleState ? "task active" : "task"}>
      <h3>{props.number}.</h3>
      <form id="edit-form" className="task-form" onSubmit={handleSubmit}>
        {props.toEdit == props.taskObj.id ? (
          <label>
            Edit:{" "}
            <input
              type="text"
              className="edit-input"
              defaultValue={props.taskObj.body}
              id="edit-input"
              autoFocus
              name="edit-input"
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
