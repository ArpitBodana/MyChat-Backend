import express from "express";
import { postController } from "../controller";
import { isAuth } from "../middlewares";

const postRouter = express.Router();

postRouter.post("/", [isAuth], postController.createPost);
postRouter.get("/timeline/all", [isAuth], postController.getTimeLinePosts);
postRouter.get("/:id", [isAuth], postController.getPost);
postRouter.patch("/:id", [isAuth], postController.updatePost);
postRouter.delete("/:id", [isAuth], postController.deletePost);
postRouter.put("/:id/like", [isAuth], postController.likePost);
export default postRouter;
