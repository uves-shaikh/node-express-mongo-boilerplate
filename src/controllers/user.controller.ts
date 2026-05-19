import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/response';
import { HTTP } from '../utils/httpStatus';
import * as userService from '../services/user.service';
import { AuthRequest } from '../middlewares/auth';

// Controllers are intentionally thin: parse input → call service → send response.
// No business logic lives here.

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await userService.registerUser(req.body);
  sendSuccess(res, { user, token }, HTTP.CREATED, 'User registered');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await userService.loginUser(req.body);
  sendSuccess(res, { user, token }, HTTP.OK, 'Login successful');
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { users, meta } = await userService.getAllUsers(req);
  sendPaginated(res, users, meta);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, user);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.user!.id);
  sendSuccess(res, user);
});
