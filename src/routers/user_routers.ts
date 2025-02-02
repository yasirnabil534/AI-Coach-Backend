import express from "express";
import { body } from "express-validator";
import apiEnum from "../utils/api_constant";
import userController from "../controllers/user_controllers";
import { process_query } from "../middlewares/process_query";
import { authenticateToken } from "../middlewares/token_authenticator";

const router = express.Router();

// ? API to create/sighin a user
router.post(
  apiEnum.REQUEST_SIGNUP,
  [
    body("name", "Name is required"),
    body("email", "Please enter a valid email").notEmpty().isEmail(),
    body("password", "Please enter at least 8 digits").isLength({ min: 8 }),
  ],
  userController.requestCreate
);

// ? API to create/sighin a user
router.post(apiEnum.SIGNUP, userController.create);

// ? API to get all user using querystring
router.get(
  apiEnum.GET_ALL,
  authenticateToken,
  process_query,
  userController.getAllUser
);

// ? API to get user by ID
router.get(
  apiEnum.GET_BY_ID,
  authenticateToken,
  userController.getUserByID
);

// ? API to update user by ID
router.put(
  apiEnum.UPDATE_BY_ID,
  authenticateToken,
  userController.updateUserByID
);

// ? API to delete user by ID
router.delete(
  apiEnum.DELETE_BY_ID,
  authenticateToken,
  userController.deleteUserByID
);

export default router;
