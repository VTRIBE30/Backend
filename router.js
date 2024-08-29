// Import routes
const { app } = require("./app");
const authRouter = require("./routes/user/authRoute");
const mainRouter = require("./routes/main/mainRoute");

// Import middleware
const errorMiddleware = require("./middlewares/errorMiddleware");
const { notFound } = require("./controllers/main/mainController");
const accountRouter = require("./routes/user/accountRoute");
const appealRouter = require("./routes/user/appealRoute");
const adminRouter = require("./routes/admin/adminRoute");
const categoryRouter = require("./routes/user/categoryRoute");
const productRouter = require("./routes/user/productRoute");
const orderRouter = require("./routes/user/orderRoute");
const feedRouter = require("./routes/user/feedRoute");
const chatRouter = require("./routes/user/chatRouter");

// Main Routes
app.use(mainRouter);

// User Routes
app.use("/v1/user/auth", authRouter);
app.use("/v1/user/account", accountRouter);
app.use("/v1/user/appeal", appealRouter);
app.use("/v1/user/category", categoryRouter);
app.use("/v1/user/product", productRouter);
app.use("/v1/user/order", orderRouter);
app.use("/v1/user/feed", feedRouter);
app.use("/v1/user/chat", chatRouter);

// Admin Routes
app.use("/v1/admin/category", adminRouter);

// Catch-all route for handling 404 not found
app.use(notFound);

// Error middleware
app.use(errorMiddleware);
