const express = require("express");
const { home } = require("../../controllers/main/mainController");
const mainRouter = express.Router();

mainRouter.get("/", home);

module.exports = mainRouter;
