/*
|--------------------------------------------------------------------------
| server.js -- The core of your server
|--------------------------------------------------------------------------
|
| This file defines how your server starts up. Think of it as the main() of your server.
| At a high level, this file does the following things:
| - Connect to the database
| - Sets up server middleware (i.e. addons that enable things like json parsing, user login)
| - Hooks up all the backend routes specified in api.js
| - Fowards frontend routes that should be handled by the React router
| - Sets up error handling in case something goes wrong when handling a request
| - Actually starts the webserver
*/

import path from "path";
import http from "http";
import express from "express";
import expressSession from "express-session";

require("dotenv").config();
const logger = require("pino")();

const session = expressSession({
  secret: "mander dung",
  resave: false,
  saveUninitialized: true,
});

import api from "./api";
import auth from "./auth";
// import passport from "./passport";

require("./db").init();

const app = express();
app.use(express.json());
app.use(session);

// app.use(passport.initialize());
// app.use(passport.session());

app.use("/auth", auth);
app.use("/api", api);

// load the compiled react files, which will serve index.html and frontend JS bundles
const reactPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(reactPath));

// for all other routes, render index.html and let react router handle it
app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"));
});

// catch fatal server errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    logger.error("The server errored when processing a request!");
    logger.error(err);
  }

  res.status(status);
  res.send({
    status: status,
  });
});

// listen to env var for port, otherwise default to 3000.
const port = process.env.PORT || 4225;
const server = new http.Server(app);

server.listen(port, () => {
  logger.info(`Serving client from ${reactPath}`);
  logger.info(`Server running on port ${port}`);
});
