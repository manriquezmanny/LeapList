function List(props) {
  const API_HOST = import.meta.env.VITE_API_HOST;
  // Function for deleting a list.
  function deleteList(listId) {
    const jwt = localStorage.getItem("jwt");
    if (confirm("Are you sure you want to delete this list?") == true) {
      fetch(`${API_HOST}/delete-list`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId: listId }),
      }).catch((e) => console.log("Error deleting list: ", e));
      props.handleDeletedList(props.id);
    }
  }

  return (
    <div
      className={"list-object"}
      onClick={props.handleClick}
      style={{
        backgroundColor: props.id == props.currentList ? "#c9ae87" : null,
        boxShadow: props.id == props.currentList ? "0 0 16px gray" : null,
      }}
    >
      <div className="list-object-text-div">
        <h3 className="list-object-text">{props.name}</h3>
        <p className="published">{props.published}</p>
      </div>
      <div className="list-object-buttons-date">
        <div className="list-object-buttons-date-nested">
          <p className="list-object-date" style={{ paddingTop: "7px" }}>
            {props.last_edited}
          </p>
          <div>
            <button
              className="list-btn"
              type="button"
              name="delete-list-object"
              style={{
                marginLeft: "2.5px",
                backgroundColor: "red",
                color: "white",
              }}
              onClick={(e) => {
                e.stopPropagation();
                deleteList(props.id);
                if (props.id == props.selectedList) {
                  props.sendSelectedList(0);
                }
              }}
            >
              Delete
              <i className="bx bx-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default List;
