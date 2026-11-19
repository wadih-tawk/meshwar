import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { signToken } from '../auth/token.js';
import { validate, SignupInput, LoginInput } from '../middleware/validate.js';
import { ipLimiter } from '../middleware/limits.js';

const authRouter = express.Router();

const signupLimiter = ipLimiter(60, 20, 'new accounts from this network');

authRouter.post('/signup', signupLimiter, validate(SignupInput), async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

authRouter.post('/login', validate(LoginInput), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  const error = 'Invalid email or password';
  if (!ok) return res.status(401).json({ error });
  res.json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export default authRouter;
