function List(props) {
  function deleteList(listId) {
    const jwt = localStorage.getItem("jwt");
    if (confirm("Are you sure you want to delete this list?") == true) {
      fetch("http://localhost:5000/delete-list", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId: listId }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res.deleted);
        })
        .catch((e) => console.log("Error deleting list: ", e));
    }
  }

  return (
    <div
      className={"list-object"}
      onClick={props.handleClick}
      style={{
        backgroundColor: props.id == props.currentList ? "#d9c8b1" : null,
      }}
    >
      <div className="list-object-text-div">
        <h3 className="list-object-text">{props.name}</h3>
      </div>
      <div className="list-object-buttons-date">
        <div className="list-object-buttons-date-nested">
          <p className="list-object-date" style={{ paddingTop: "7px" }}>
            {props.date}
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
                props.handleDeletedList(props.id);
                if (props.id == props.selectedList) {
                  props.sendSelectedList(0);
                }
                console.log("Delete button Clicked!", props.id);
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
