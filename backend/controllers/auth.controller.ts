// // controllers/auth.controller.ts
// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import User from '../models/User';

// const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// export const register = async (req: Request, res: Response) => {
//   const { fullName, email, password } = req.body;
//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ error: 'Email already used' });

//     const hashed = await bcrypt.hash(password, 10);
//     await User.create({ fullName, email, password: hashed });

//     res.status(201).json({ message: 'User registered' });
//   } catch (err) {
//     res.status(500).json({ error: 'Signup failed' });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// };


// controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET   = process.env.JWT_SECRET   || "super_secret_change_me_123";
const DEMO_EMAIL   = process.env.DEMO_EMAIL   || "demo@client.com";
const DEMO_PASSWORD= process.env.DEMO_PASSWORD|| "123456";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 🔒 Presentation/Demo path (NO DB). Accept the one pair only.
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = jwt.sign({ userId: "demo-user" }, JWT_SECRET, { expiresIn: "1d" });
      return res.json({ success: true, token });
    }

    // If it reaches here, reject.
    return res.status(401).json({ error: "Invalid email or password" });
  } catch (e) {
    return res.status(500).json({ error: "Login failed" });
  }
};
