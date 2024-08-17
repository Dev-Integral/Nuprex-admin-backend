const express = require("express");
const app = express();
const cors = require("cors");
const serverPort = "5000";
const adminAuthRouter = require('./routes/adminAuthRouter');
// static files
app.use(express.static("./public"));

// Enable CORS for all requests
app.use(cors());

//parse request data body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Available API routes
app.use("/api/admin", adminAuthRouter);

// Wildcard for if route doesn't match
app.all("*", (_req, res) =>
    res
      .status(404)
      .sendFile(path.resolve(__dirname, "./public/pageNotFound.html"))
  );
  
  app.listen(serverPort, () => console.log(`listening on port: ${serverPort}...`));
  
  
  module.exports = app;
  
