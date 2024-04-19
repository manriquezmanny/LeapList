function List(props) {
  return (
    <div className="list-object" onClick={props.handleClick}>
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
