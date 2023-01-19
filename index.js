import express from "express";
import {
  APP_PORT,
  CLIENT_SOCKET,
  DATABASE_URL,
  MONGO_ATLAS,
} from "./src/config";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import {
  convoRouter,
  messageRouter,
  postRouter,
  userRouter,
} from "./src/routes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
//socket.io
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
  console.log(users);
};
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  console.log(users);
};
const getUser = (userId) => {
  return users.find((user) => user.socketId !== userId);
};
io.on("connection", (socket) => {
  //set connection
  console.log("socket is running !!");
  //setup
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  //room join
  socket.on("joinChat", (room) => {
    socket.join(room);
  });
  //get userId and socketId
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getOnlineUsers", users);
  });

  //send message with room
  socket.on("newMessage", (newMessageData) => {
    var chat = newMessageData.currentConversation;
    chat.members.forEach((user) => {
      if (user === newMessageData.sender) return;
      socket.in(user).emit("message recieved", newMessageData);
    });
  });
  //typing indicator
  socket.on("typing", (data) => {
    data.members.forEach((user) => {
      if (user === data.sender) return;
      socket.in(user).emit("frndTyping", data);
    });
  });

  //stop typing
  socket.on("stop typing", (data) => {
    data.members.forEach((user) => {
      if (user === data.sender) return;
      socket.in(user).emit("stopfrndTyping", data);
    });
  });

  //delete message
  socket.on("deleteMessage", (newMessageData) => {
    var chat = newMessageData.currentConversation;
    chat.members.forEach((user) => {
      if (user === newMessageData.data.sender) return;
      socket.in(user).emit("message delete", newMessageData.data);
    });
  });

  //disconnect
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getOnlineUsers", users);
  });
});

//db
mongoose.connect(MONGO_ATLAS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/conversation", convoRouter);
app.use("/api/message", messageRouter);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "DataBase connection error!!"));
db.on("open", () => console.log("Database is Connected!!"));

app.get("/", (req, res) => {
  res.send({ msg: "Api Deployed Successfully !!" });
});
app.get("*", (req, res) => {
  res.json({ msg: "No route found !!" });
});

server.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});
