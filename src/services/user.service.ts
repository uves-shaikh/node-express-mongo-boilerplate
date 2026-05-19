import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { HTTP } from '../utils/httpStatus';
import { config } from '../config';
import { RegisterInput, LoginInput } from '../types/user.schemas';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { Request } from 'express';

// Service layer owns business logic — keeps controllers as thin HTTP adapters.
// If you later move to GraphQL or gRPC, only the transport layer changes.

const signToken = (user: IUser): string =>
  jwt.sign({ id: user._id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError('Email already in use', HTTP.CONFLICT);

  const user = await User.create(input);
  const token = signToken(user);
  return { user, token };
};

export const loginUser = async (input: LoginInput) => {
  // Fetch with password (excluded by default via toJSON transform)
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) throw new AppError('Invalid credentials', HTTP.UNAUTHORIZED);

  const isValid = await user.comparePassword(input.password);
  if (!isValid) throw new AppError('Invalid credentials', HTTP.UNAUTHORIZED);

  const token = signToken(user);
  return { user, token };
};

export const getAllUsers = async (req: Request) => {
  const { page, limit, skip } = getPagination(req);
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);
  return { users, meta: buildPaginationMeta(page, limit, total) };
};

export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', HTTP.NOT_FOUND);
  return user;
};
