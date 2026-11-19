import { z } from 'zod';
import { ACTIVITIES } from '../models/Outing.js';

const id = message => z.string(message).regex(/^[a-f0-9]{24}$/, message);
const oneLineBreak = text => text.replace(/\r\n/g, '\n');
const personName = z
  .string('Name is required')
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name must be at most 50 characters')
  .regex(/^[^<>\u0000-\u001f\u007f-\u009f\p{Cf}]*$/u, 'Name cannot contain < >, line breaks or invisible characters');

export const SignupInput = z.object({
  name: personName,
  email: z.string('Email is required').trim().toLowerCase().email('Enter a valid email'),
  password: z.string('Password is required').min(8, 'Password must be at least 8 characters').max(72, 'Password must be at most 72 characters'),
});

export const LoginInput = z.object({
  email: z.string('Email is required').trim().toLowerCase().min(1, 'Email is required'),
  password: z.string('Password is required').min(1, 'Password is required'),
});

export const ProfileInput = z.object({
  name: personName,
  bio: z.string('Bio must be text').trim().max(300, 'Bio must be at most 300 characters').default(''),
});

export const FriendRequestInput = z.object({
  userId: id('Choose a person'),
});

const caption = z
  .string('Caption must be text')
  .overwrite(oneLineBreak)
  .trim()
  .max(500, 'Captions must be at most 500 characters');

export const PostInput = z.object({
  caption: caption.default(''),
  outingId: id('Invalid outing id').optional(),
});

export const PostUpdateInput = z.object({
  caption,
  hidden: z.boolean('Hidden must be true or false'),
});

export const StoryInput = z.object({
  caption: z.string('Caption must be text').trim().max(100, 'Story captions must be at most 100 characters').default(''),
});

export const CommentInput = z.object({
  text: z.string('Write a comment').overwrite(oneLineBreak).trim().min(1, 'Write a comment').max(300, 'Comments must be at most 300 characters'),
});

export const ShareInput = z.object({
  friendId: id('Choose a friend'),
  note: z.string('The note must be text').overwrite(oneLineBreak).trim().max(200, 'Notes must be at most 200 characters').default(''),
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
