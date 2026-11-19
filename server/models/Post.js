import mongoose from 'mongoose';

const outingSnapshot = new mongoose.Schema({ title: String, place: String, activity: String }, { _id: false });

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
    caption: { type: String, default: '', maxlength: 500 },
    outing: { type: outingSnapshot, default: null },
    hidden: { type: Boolean, default: false },
    likes: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hidden: 1, createdAt: -1 });

export function visibleTo(userId) {
  return { $or: [{ hidden: false }, { author: userId }] };
}

export default mongoose.model('Post', postSchema);
