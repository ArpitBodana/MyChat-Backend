import express from "express";
import userController from "../controller/userController";
import { isAuth } from "../middlewares";

const userRouter = express.Router();

userRouter.post("/register", userController.registerUser);
userRouter.post("/signin", userController.signIn);
userRouter.get("/users", userController.getAllUsers);
userRouter.put("/users/profile", [isAuth], userController.updateUser);
userRouter.delete("/users/profile", [isAuth], userController.deleteUser);
userRouter.get("/users/search", [isAuth], userController.searchUser);
userRouter.put("/users/:id/follow", [isAuth], userController.followUser);
userRouter.put("/users/:id/unfollow", [isAuth], userController.unfollowUser);
userRouter.put("/users/request/accept", [isAuth], userController.acceptRequest);
userRouter.put("/users/request/reject", [isAuth], userController.rejectRequest);

export default userRouter;
