import { z } from 'zod';
import { ACTIVITIES } from '../models/Outing.js';

export const SignupInput = z.object({
  name: z.string('Name is required').trim().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  email: z.string('Email is required').trim().toLowerCase().email('Enter a valid email'),
  password: z.string('Password is required').min(8, 'Password must be at least 8 characters').max(72, 'Password must be at most 72 characters'),
});

export const LoginInput = z.object({
  email: z.string('Email is required').trim().toLowerCase().min(1, 'Email is required'),
  password: z.string('Password is required').min(1, 'Password is required'),
});

export const OutingInput = z.object({
  title: z.string('Title is required').trim().min(1, 'Title is required').max(80, 'Title must be at most 80 characters'),
  activity: z.enum(ACTIVITIES, `Activity must be one of: ${ACTIVITIES.join(', ')}`),
  place: z.object(
    {
      name: z.string().trim().min(1, 'Place name is required').max(100),
      country: z.string().trim().max(100).default(''),
      lat: z.number('Latitude must be a number').min(-90).max(90),
      lon: z.number('Longitude must be a number').min(-180).max(180),
    },
    'Pick a place from the search results'
  ),
  date: z.iso.date('Date must be a real day written YYYY-MM-DD'),
  notes: z.string().trim().max(500, 'Notes must be at most 500 characters').default(''),
});

export const validate = schema => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.issues[0].message;
    return res.status(400).json({ error: msg });
  }
  req.body = result.data;
  next();
};
