const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRouter = require("./routes/users");
const groupRouter = require("./routes/group");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const Group = require("./models/groupSchema");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//mongoDb database connect

mongoose
  .connect(
    "mongodb+srv://bhavinkoladiya6:bk123@cluster0.tssmvej.mongodb.net/chat_api"
  )
  .then(() => console.log("database connected"))
  .catch((error) => console.log(error.mongoose));

app.use(bodyParser.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/group", groupRouter);

io.on("connection", (socket) => {
  console.log("socket connected");
  var queryParams = socket.handshake.query;

  //Event handler for User Login
  socket.on("authenticate", async ({ email, password }) => {
    try {
      if (!email || !password) {
        return socket.emit("auth_error", "email and password required");
      }

      var user = await User.findOne({ email });
      if (!user) {
        return socket.emit("auth_error", "invalid email and password");
      }

      isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return socket.emit("auth_error", "invalid email and password");
      }

      await User.findByIdAndUpdate(user._id, { is_online: "1" });

      //Emit a notification to all connected users that this user is online
      io.emit("user_online", { userId: user._id, isOnline: true });

      socket.user = user;

      const userData = await User.find({ _id: { $ne: user._id } }); //$ne:not equal
      const groupData = await Group.find({ creator_id: { $eq: user._id } }); //$ne:not equal

      if (!userData && !groupData) {
        return socket.emit("auth_error", { message: "no user found" });
      }

      //Emit a getAllChatsList to all connected users
      socket.emit("getAllChatsList", { allUserChatsList: userData, groupData });
    } catch (error) {
      socket.emit("auth_error", { message: error.message });
    }
  });

  //catch Event  for adding a group member
  socket.on("addGroupmember", async (data) => {
    try {
      const groupmember = await Group.findOneAndUpdate(
        {
          creator_id: queryParams.creatorData,
          _id: queryParams.groupData,
        },
        { member_ids: data.member_ids },
        { new: true }
      ).populate({
        path: "creator_id member_ids",
        select: "name image _id",
      });

      //emit userConnect event to all group member to new user has join this group
      groupmember.member_ids.forEach((member) => {
        socket.emit("userConnect", {
          message: `${member.name} has join this group`,
        });
      });

      const getAllMembers = await Group.find().populate({
        path: "creator_id member_ids",
        select: "name image _id",
      });

      //emit memberList event to get all group menber list
      socket.emit("memberList", { getAllMembers });
    } catch (error) {
      socket.emit("addGroupmemberError", { message: error.message });
    }
  });

  //users disconnect or logout
  socket.on("disconnect", async (socket) => {
    if (socket.user) {
      await User.findByIdAndUpdate(socket.user._id, { is_online: "0" });
      // Broadcast to all clients that a user is offline
      socket.brodcast.emit("user_online", {
        userId: socket.user._id,
        isOnline: false,
      });
    }
  });

  //receiver message from client side
  socket.on("send_message", async ({ sender_id, receiver_id, message }) => {
    try {
      const messagedata = {
        sender_id,
        receiver_id,
        message,
      };

      const messageDoc = await Chat.create(messagedata);
      const populateMessage = await messageDoc.populate({
        path: "sender_id receiver_id",
        select: "name _id is_online",
      });

      //send message from server to client
      socket.emit("reveive_message", { populateMessage });
    } catch (error) {
      return socket.emit("error", "message not send");
    }
  });

  //To get all messages between two users or within a group
  socket.on("getMessages", async ({ sender_id, receiver_id }) => {
    try {
      const AllmessageDoc = await Chat.find({
        $or: [
          //$or:OR operation
          { sender_id: sender_id, receiver_id: receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      }).populate({
        path: "sender_id receiver_id",
        select: "name _id is_online",
      });

      socket.emit("reveiveAll_message", { AllmessageDoc });
    } catch (error) {
      return socket.emit("error", "message not send");
    }
  });
  socket.on("deleteMessages", async ({ message_id, sender_id }) => {
    try {
      const deleteMessageDoc = await Chat.deleteOne({
        $or: [{ _id: message_id }, { sender_id: sender_id }], //#or:OR operation
      });

      socket.emit("deletemessage", { deleteMessageDoc });
    } catch (error) {
      return socket.emit("error", "message delete ");
    }
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
