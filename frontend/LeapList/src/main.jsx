import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Register from "./Register.jsx";
import Login from "./Login.jsx";

// Creating a router with createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: `https://frontend-vite-react-production.up.railway.app/register`,
    element: <Register />,
  },
  {
    path: `https://frontend-vite-react-production.up.railway/log-in`,
    element: <Login />,
  },
]);

// Configuring router settings

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
