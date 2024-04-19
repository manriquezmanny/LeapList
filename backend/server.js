import express from "express";
import cors from "cors";
import mysqlPromise from "mysql2/promise.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import "dotenv/config";

const app = express();
const port = process.env.PORT;

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
});

app.use(cors(corsOptions));

// Makes express auto parse the JSON body of any requests and adds the body to the req object.
app.use(bodyParser.json());

// Middleware for connecting to database.
app.use(async (req, res, next) => {
  try {
    // Connecting to my SQL db. req gets modified and gets sent to next middleware and endpoint functions.
    req.db = await pool.getConnection();
    req.db.connection.config.namedPlaceholders = true;

    // Traditional mode ensures not null is respected for unsupplied fields, ensures valid JavaScript dates, etc.
    await req.db.query('SET SESSION sql_mode = "TRADITIONAL"');
    await req.db.query(`SET time_zone = '-8:00'`);

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

// POST register endpoint
app.post("/register", async function (req, res) {
  try {
    const { username, password, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await req.db.query(
      `INSERT INTO users (username, password, email )
      VALUES (:username, :hashedPassword, :email);`,
      { username, hashedPassword, email }
    );

    const jwtEncodedUser = jwt.sign(
      { userId: user.insertId, username, email },
      process.env.JWT_KEY
    );

    res.json({
      jwt: jwtEncodedUser,
      success: true,
      username: username,
      email: email,
    });
  } catch (e) {
    console.log("error", e);
    res.json({ e, success: false });
  }
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

    if (passwordMatches) {
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
      });
    } else {
      res.json({
        err: "Password is wrong",
        success: false,
      });
    }
  } catch (e) {
    console.log("Error in /authenticage", e);
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
      req.app.emit("jwt-error", err, req);
    } else {
      throw (err.status || 500, e.message);
    }
  }
  next();
});

// Get current user's lists.
app.get("/lists", async (req, res) => {
  // Getting user id.
  const userId = req.user.userId;

  // Getting user's lists with sql query.
  const [[lists]] = await req.db.query(
    `SELECT * FROM lists 
     WHERE user_id = :userId`,
    { userId }
  );
  res.json({ lists: lists });
});

// Get selected list's tasks
app.post("/tasks", async (req, res) => {
  // Getting posted list id

  const list_id = req.body.list_id;

  // Getting selected list's tasks
  const [tasks] = await req.db.query(
    `SELECT * FROM tasks
    WHERE list_id = :list_id`,
    { list_id }
  );

  console.log(JSON.stringify(tasks));
  res.json({ tasks: JSON.stringify(tasks) });
});

app.post("/add", async (req, res) => {
  console.log("inside");
  const { list_id, body, complete } = req.body;
  console.log(list_id, body);

  await req.db.query(
    `
  INSERT INTO tasks (list_id, body, complete)
  VALUES(:list_id, :body, :complete)`,
    { list_id, body, complete }
  );

  res.json({ added: "added Task" });
});

// Start express server
app.listen(port, () => {
  console.log("Server is running");
});
