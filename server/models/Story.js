import mongoose from 'mongoose';

export const STORY_HOURS = 24;

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
    caption: { type: String, default: '', maxlength: 100 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, createdAt: 1 });

export function stillActive() {
  return mongoose.trusted({ $gt: new Date() });
}

export default mongoose.model('Story', storySchema);
