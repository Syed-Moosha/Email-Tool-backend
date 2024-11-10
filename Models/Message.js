import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true }, 
        recipients: [{ type: String, required: true }],
        subject: { type: String, required: true },
        body: { type: String, required: true },
        status: { type: String, enum: ["Sent", "Failed"], default: "Sent" },
        sentAt: { type: Date, default: Date.now },
      },
      { timestamps: true }
  );
const Message = mongoose.model("Message", messageSchema);
export default Message;