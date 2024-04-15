function List(props) {
  return (
    <div className="list-object">
      <div className="list-object-text-div">
        <h3 className="list-object-text">{props.name}</h3>
      </div>
      <div className="list-object-buttons-date">
        <div className="list-object-buttons-date-nested">
          <p className="list-object-date">{props.date}</p>
          <div>
            <button
              className="list-btn"
              type="button"
              name="edit-list-name"
              style={{ backgroundColor: "blue", color: "white" }}
            >
              <i className="bx bx-edit"></i>
            </button>
            <button
              className="list-btn"
              type="button"
              name="delete-list-object"
              style={{
                marginLeft: "2.5px",
                backgroundColor: "red",
                color: "white",
              }}
            >
              <i className="bx bx-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default List;
