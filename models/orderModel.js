import mongoose from "mongoose";
import foodModel from "./foodModel.js";

const extendedItemSchema = new mongoose.Schema({
  ...foodModel.schema.obj,
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: [extendedItemSchema], required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food processing" },
  date: { type: Date, default: Date.now() },
  payment: { type: Boolean, default: false },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
