const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const passport = require('passport');
const session = require('express-session');
require('./utils/passportConfig'); 
const serverPort = "5000";
const adminAuthRouters = require("./routes/adminAuthRouters");
const customerRouters = require("./routes/customerRouters");
const orderRouters = require("./routes/orderRouters");
const riderRouters = require("./routes/riderRouters");
// static files
app.use(express.static("./public"));

// Enable CORS for all requests
app.use(cors());

//parse request data body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Session management
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Use the auth routes
const googleAuthRoutes = require('./routes/googleOAuth');

// Available API routes
app.use("/api/admin", adminAuthRouters);
app.use("/api/customer", customerRouters);
app.use("/api/order", orderRouters);
app.use("/api/rider", riderRouters);
app.use("/api/social", googleAuthRoutes);

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
