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
  },
  { timestamps: true }
);

export default mongoose.model('Image', imageSchema);
