import express from "express";
import { conversationController } from "../controller";
import { isAuth } from "../middlewares";

const convoRouter = express.Router();

convoRouter.post("/start", [isAuth], conversationController.startConversation);
convoRouter.post("/:id", [isAuth], conversationController.getUserConverstaion);
convoRouter.get("/:id", [isAuth], conversationController.getOneConverstaion);
convoRouter.delete(
  "/delete",
  [isAuth],
  conversationController.deleteConverSation
);
convoRouter.delete(
  "/unfollow/delete",
  [isAuth],
  conversationController.oneDeleteConverstaion
);

export default convoRouter;
