const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { containsProfanity, cleanText } = require("../middleware/profanityFilter");
const { isBlockedEitherWay } = require("../controllers/blockController");

function registerChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("send_message", async ({ conversationId, content, fileUrl }) => {
      try {
        if (!content || !content.trim()) return;

       const convo = await Conversation.findById(conversationId);
        if (!convo || !convo.participants.some((p) => p.toString() === socket.userId)) {
          return socket.emit("chat_error", { message: "You're not part of this conversation" });
        }

        const otherId = convo.participants.find((p) => p.toString() !== socket.userId);
        if (otherId && (await isBlockedEitherWay(socket.userId, otherId))) {
          return socket.emit("chat_error", { message: "You can't message this person" });
        }

        const safeContent = containsProfanity(content) ? cleanText(content) : content;

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          content: safeContent,
          fileUrl: fileUrl || null,
        });
        await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });
        io.to(`conversation:${conversationId}`).emit("new_message", message);

        if (otherId) {
          const sender = await User.findById(socket.userId).select("anonymousUsername");
          await Notification.create({
            user: otherId,
            type: "new_message",
            message: `${sender?.anonymousUsername || "Someone"} sent you a message.`,
            relatedConversation: conversationId,
          });
        }
      } catch (err) {
        socket.emit("chat_error", { message: "Could not send message" });
      }
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("typing", { userId: socket.userId, isTyping });
    });
  });
}

module.exports = registerChatSocket;