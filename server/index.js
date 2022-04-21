"use strict";

const config = require("./config");
const contentTypes = require("./content-types");
const controllers = require("./controllers");
const routes = require("./routes");
const middlewares = require("./middlewares");
const policies = require("./policies");
const services = require("./services");

module.exports = {
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares,
};
