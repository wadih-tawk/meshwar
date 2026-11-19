import mongoose from 'mongoose';

export const ACTIVITIES = ['hike', 'beach', 'ski', 'picnic', 'city', 'other'];

const outingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    activity: { type: String, enum: ACTIVITIES, required: true },
    place: {
      name: { type: String, required: true },
      country: { type: String, default: '' },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

outingSchema.index({ userId: 1, date: 1 });

export default mongoose.model('Outing', outingSchema);
