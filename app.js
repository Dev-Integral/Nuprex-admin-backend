const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const serverPort = "5000";
const adminAuthRouters = require("./routes/adminAuthRouters");
const customerRouters = require("./routes/customerRouters");
const orderRouters = require("./routes/orderRouters");
// static files
app.use(express.static("./public"));

// Enable CORS for all requests
app.use(cors());

//parse request data body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Available API routes
app.use("/api/admin", adminAuthRouters);
app.use("/api/customer", customerRouters);
app.use("/api/order", orderRouters);

// Wildcard for if route doesn't match
app.all("*", (_req, res) =>
  res
    .status(404)
    .sendFile(path.resolve(__dirname, "./public/pageNotFound.html"))
);

app.listen(serverPort, () =>
  console.log(`listening on port: ${serverPort}...`)
);

module.exports = app;
