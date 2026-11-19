import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    purpose: { type: String, enum: ['avatar', 'post', 'story'], required: true },
    data: { type: Buffer, required: true },
    contentType: { type: String, default: 'image/jpeg' },
    width: Number,
    height: Number,
    size: Number,
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

imageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Image', imageSchema);
