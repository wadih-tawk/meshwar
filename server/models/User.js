import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 300 },
    avatarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
