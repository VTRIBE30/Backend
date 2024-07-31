const mongoose = require("mongoose");

const appealSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  subject: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
});

const Appeal = mongoose.model("Appeal", appealSchema);

module.exports = Appeal;
