import express from "express";
import cors from "cors";
import mysqlPromise from "mysql2/promise.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import "dotenv/config";
import moment from "moment-timezone";
import nodemailer from "nodemailer";

const port = process.env.PORT || 3000;

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  "access-control-allow-credentials": true,
  optionSuccessStatus: 200,
};

const pool = mysqlPromise.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const sendMail = (email, verifyToken) => {
  const Transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Leap List",
    to: email,
    subject: "Email Verification",
    html: `Click <a href=${process.env.CLIENT_HOST}/verify/${verifyToken}> Here </a> to verify your email.`,
  };

  Transport.sendMail(mailOptions, (error, res) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Verification Email Sent");
    }
  });
};

app.use(cors(corsOptions));

// Makes express auto parse the JSON body of any requests and adds the body to the req object.
app.use(bodyParser.json());

// Middleware for connecting to database.
app.use(async (req, res, next) => {
  try {
    console.log("attempting to connect to db");
    // Connecting to my SQL db. req gets modified and gets sent to next middleware and endpoint functions.
    req.db = await pool.getConnection();
    console.log("Got connection");
    req.db.connection.config.namedPlaceholders = true;

    // Traditional mode ensures not null is respected for unsupplied fields, ensures valid JavaScript dates, etc.
    await req.db.query('SET SESSION sql_mode = "TRADITIONAL"');
    const timeZone = moment.tz(moment.tz.guess()).format("z");
    await req.db.query(`SET time_zone = '${timeZone}'`);

    // Moves the request down the line to the next middleware and/or endpoints it's headed to.
    next();

    // After the endpoint has been reached and resolved, disconnects from the database
    req.db.release();
  } catch (e) {
    // If anything dowvnstream throws an error, releasing the connection allocated for the request.
    console.log(e);
    // If an error occurs, disconnecting from the database
    if (req.db) req.db.release();
    throw e;
  }
});

app.get("/", async (req, res) => {
  res.json({ Hello: "there" });
});

// POST register endpoint
app.post("/register", async function (req, res) {
  try {
    const { username, password, email, verifyToken } = req.body;
    console.log("Got JSON body");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("encrypted password");

    sendMail(email, verifyToken);
    console.log("Email verification sent");

    const [user] = await req.db.query(
      `INSERT INTO users (username, password, email )
      VALUES (:username, :hashedPassword, :email, :verifyToken);`,
      { username, hashedPassword, email, verifyToken }
    );
    console.log("made db query");

    const jwtEncodedUser = jwt.sign(
      { userId: user.insertId, username, email },
      process.env.JWT_KEY
    );
    console.log("USED JWT_KEY");
    res.json({
      jwt: jwtEncodedUser,
      success: true,
      username: username,
      email: email,
    });
  } catch (e) {
    if (e.errno == 1062) {
      res.json({ e, success: false, emailExists: true });
    } else {
      res.json({ e, success: false });
    }
  }
});

app.get(`verify/:verifyToken`, async (req, res) => {
  // Getting the token
  const { verifyToken } = req.params;

  const [[user]] = await req.db.query(
    `SELECT * FROM users WHERE verifyToken = :verifyToken`,
    { verifyToken }
  );

  if (user) {
    `UPDATE users SET verified = 1 WHERE verifyToken = :verifyToken`,
      { verifyToken };
  }

  res.redirect("/log-in");
});

// POST login
app.post("/log-in", async function (req, res) {
  try {
    const { email, password } = req.body;

    const [[user]] = await req.db.query(
      `SELECT * FROM users WHERE email = :email`,
      { email }
    );

    if (!user) {
      console.log("User not found");
      return res.json({ email: false });
    }

    const hashedPassword = user.password;
    const passwordMatches = await bcrypt.compare(password, hashedPassword);

    if (passwordMatches && user.verified) {
      const payload = {
        userId: user.id,
        username: user.username,
        email: user.email,
      };
      const jwtEncodedUser = jwt.sign(payload, process.env.JWT_KEY);
      res.json({
        jwt: jwtEncodedUser,
        success: true,
        username: user.username,
        email: email,
        verified: user.verified,
      });
    } else if (passwordMatches && !user.verified) {
      res.json({ err: "Pleases verify your Email", success: false });
    } else {
      res.json({
        err: "Incorrect Password or Email",
        success: false,
      });
    }
  } catch (e) {
    console.log("Error in /authenticate", e);
  }
});

// Delete a task
// Not using url param, I don't want users deleting lists with url without clicking button.
app.delete("/delete-task", async (req, res) => {
  const { taskId, listId } = req.body;

  try {
    await req.db.query(`DELETE FROM tasks WHERE id = :taskId`, { taskId });
    await req.db.query(
      `UPDATE lists SET last_edited = NOW() WHERE id = :listId`,
      {
        listId,
      }
    );
    res.json({ deleted: "Deleted task Succesfully" });
  } catch (e) {
    console.log("Error making db query for deleting list", e);
  }
});

// Jwt verification checks to see if there is an authorization header with a valid jwt in it.
app.use(async function verifyJwt(req, res, next) {
  const { authorization: authHeader } = req.headers;

  if (!authHeader) res.json("Invalid authorization, no authorization headers");

  const [scheme, jwtToken] = authHeader.split(" ");

  if (scheme != "Bearer")
    res.json("Invalid authorization, invalid authorization scheme");

  try {
    const decodedJwtObject = jwt.verify(jwtToken, process.env.JWT_KEY);
    req.user = decodedJwtObject;
  } catch (e) {
    console.log(e);
    if (
      e.message &&
      (e.message.toUpperCase() === "INVALID TOKEN" ||
        e.message.toUpperCase() === "JWT EXPIRED")
    ) {
      req.status = e.status || 500;
      req.body = e.message;
      req.app.emit("jwt-error", e, req);
    } else {
      throw (e.status || 500, e.message);
    }
  }
  next();
});

// Get current user's lists.
app.get("/lists", async (req, res) => {
  // Getting user id.
  const userId = req.user.userId;

  // Getting user's lists with sql query.
  const [lists] = await req.db.query(
    `SELECT * FROM lists 
     WHERE user_id = :userId ORDER BY last_edited DESC`,
    { userId }
  );
  res.json({ lists: lists });
});

// Gets current user's Id
app.post("/get-user-id", async (req, res) => {
  const { username, email } = req.body;

  // Getting the id from db
  const [[id]] = await req.db.query(
    `
  SELECT id FROM users
  WHERE username= :username AND email= :email`,
    { username, email }
  );

  res.json({ id: id });
});

// Adds new list to db
app.post("/add-user-list", async (req, res) => {
  const { listName } = req.body;
  const userId = req.user.userId;
  try {
    await req.db.query(
      `INSERT INTO lists(user_id, list_name) VALUES(:userId, :listName)`,
      { userId, listName }
    );
    console.log("Added list to db.");
  } catch (e) {
    console.log("Error adding new list into db: ", e);
  }

  try {
    const [newListRes] = await req.db.query(
      `SELECT * FROM lists WHERE user_id = :userId AND list_name = :listName ORDER BY id DESC`,
      { userId, listName }
    );
    res.json({ newListRes: newListRes[0] });
  } catch (e) {
    console.log("Error getting the new list from db", e);
  }
});

// Get the selected list's tasks
app.post("/tasks", async (req, res) => {
  // Getting posted list id

  const list_id = req.body.list_id;

  // Getting selected list's tasks
  const [tasks] = await req.db.query(
    `SELECT * FROM tasks
    WHERE list_id = :list_id`,
    { list_id }
  );
  res.json({ tasks: JSON.stringify(tasks) });
});

// Add a task
app.post("/add", async (req, res) => {
  const { list_id, body, complete } = req.body;
  await req.db.query(
    `
  INSERT INTO tasks (list_id, body, complete)
  VALUES(:list_id, :body, :complete)`,
    { list_id, body, complete }
  );

  const [newTaskId] = await req.db.query(
    `SELECT id FROM tasks WHERE body= :body and list_id = :list_id ORDER BY id DESC`,
    { body, list_id }
  );

  try {
    await req.db.query(
      `UPDATE lists SET last_edited = NOW() WHERE id = :list_id`,
      {
        list_id,
      }
    );
  } catch (e) {
    console.log("Error updating last edited time for list", e);
  }

  res.json({ newId: newTaskId[0] });
});

// Delete a list
// Not using url param, I don't want users deleting lists with url without clicking button.
app.delete("/delete-list", async (req, res) => {
  const { listId } = req.body;

  try {
    await req.db.query(`DELETE FROM tasks WHERE list_id= :listId`, { listId });
    await req.db.query(`DELETE FROM lists WHERE id= :listId`, { listId });

    res.json({ deleted: "Delete Succesful" });
  } catch (e) {
    console.log("Error making db query for deleting list", e);
  }
});

// Edit completion state of task
app.put("/toggle-task", async (req, res) => {
  const { newState, taskId, listId } = req.body;

  try {
    await req.db.query(
      "UPDATE tasks SET complete = :newState WHERE id = :taskId",
      { newState, taskId }
    );
  } catch (e) {
    console.log("Error editing completion state of task", e);
  }
  try {
    await req.db.query(
      `UPDATE lists SET last_edited = NOW() WHERE id = :listId`,
      {
        listId,
      }
    );
    res.json({ edited: "Succesfully Edited completion state of task" });
    console.log("Succesfully edited task and updated list");
  } catch (e) {
    console.log("Error updating last edited time for list", e);
  }
});

// Edit a task
app.put("/edit-task", async (req, res) => {
  const { taskId, newText, listId } = req.body;

  try {
    await req.db.query(`UPDATE tasks SET body = :newText WHERE id = :taskId`, {
      newText,
      taskId,
    });
    console.log("Succesfully updated task");
  } catch (e) {
    console.log("Error updating task: ", e);
  }

  try {
    await req.db.query(
      `UPDATE lists SET last_edited = NOW() WHERE id = :listId`,
      {
        listId,
      }
    );
    console.log("Succesfully edited task and updated list");
  } catch (e) {
    console.log("Error updating last edited time for list", e);
  }

  try {
    const userId = req.user.userId;
    // Getting user's lists with sql query.
    const [lists] = await req.db.query(
      `SELECT * FROM lists 
       WHERE user_id = :userId ORDER BY last_edited DESC`,
      { userId }
    );
    res.json({ lists: lists });
  } catch (e) {
    console.log(e);
  }
});

// Start express server
app.listen(port, "0.0.0.0", function () {
  console.log(`Server is running on port: ${port}`);
});
