import bcrypt from 'bcrypt';
import { prisma } from '../server.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/errorHandler.js';

export const authService = {
  async signup(email, password, name, role) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    return { user, token };
  },

  async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userWithoutPassword, token };
  },

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return user;
  },

  async updateProfile(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },
};
