// Import routes
const { app } = require("./app");
const authRouter = require("./routes/user/authRoute");
const mainRouter = require("./routes/main/mainRoute");

// Import middleware
const errorMiddleware = require("./middlewares/errorMiddleware");
const { notFound } = require("./controllers/main/mainController");
const accountRouter = require("./routes/user/accountRoute");

// Main Routes
app.use(mainRouter);

// User Routes
app.use("/v1/user/auth", authRouter);
app.use("/v1/user/account", accountRouter);


// Catch-all route for handling 404 not found
app.use(notFound);

// Error middleware
app.use(errorMiddleware);
