import express from "express";
import { messageController } from "../controller";
import { isAuth } from "../middlewares";

const messageRouter = express.Router();

messageRouter.post("/:id", [isAuth], messageController.addMesssage);
messageRouter.get("/:id", [isAuth], messageController.getMessages);
messageRouter.delete(
  "/deleteone/:id",
  [isAuth],
  messageController.deleteOneMessage
);
messageRouter.get("/unread/:convoId", [isAuth], messageController.unreadMessagess);
messageRouter.put("/read/:convoId", [isAuth], messageController.readMessage);

export default messageRouter;
