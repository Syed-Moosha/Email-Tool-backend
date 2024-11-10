import Message from "../Models/Message.js";
import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";

export const composeMail = async (req, res, next) => {
  const { senderEmail, recipients, subject, body } = req.body;

  if (!senderEmail || !recipients || !subject || !body) {
    return next(
      errorHandler(
        400,
        "All fields (sender, recipients, subject, body) are required"
      )
    );
  }

  const recipientEmails = recipients.split(";").map((email) => email.trim());

  try {
    const registeredRecipients = await User.find({
      email: { $in: recipientEmails },
    }).select("email");
    const registeredEmails = registeredRecipients.map((user) => user.email);
    const invalidEmails = recipientEmails.filter(
      (email) => !registeredEmails.includes(email)
    );

    const status = invalidEmails.length === 0 ? "Sent" : "Failed";

    const message = new Message({
      sender: senderEmail,
      recipients: recipientEmails,
      subject,
      body,
      status,
    });

    await message.save();

    if (invalidEmails.length > 0) {
      res.status(400).json({
        message: `Message delivery failed: Some recipients are not registered users (${invalidEmails.join(
          ", "
        )})`,
        messageData: message,
      });
    } else {
      res.status(200).json({
        message: "Message sent successfully!",
        result: message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getInbox = async (req, res, next) => {
  const { email } = req.params;

  try {
    console.log("Fetching messages for email:", email);
    const messages = await Message.find({ recipients: email }).sort({
      createdAt: -1,
    });

    if (!messages.length) {
      return res.status(200).json({ success: true, messages: [] });
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching inbox messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching inbox messages" });
    next(error);
  }
};

export const getSentMessages = async (req, res, next) => {
  const { email } = req.params;

  try {
    const messages = await Message.find({ sender: email }).sort({
      createdAt: -1,
    });

    res
      .status(200)
      .json({ success: true, messages: messages.length ? messages : [] });
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching sent messages" });
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};
