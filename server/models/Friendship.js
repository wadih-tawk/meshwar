import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema(
  {
    pair: { type: String, required: true, unique: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  },
  { timestamps: true }
);

friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

export function pairKey(a, b) {
  return [String(a), String(b)].sort().join(':');
}

export async function areFriends(a, b) {
  const found = await Friendship.exists({ pair: pairKey(a, b), status: 'accepted' });
  return Boolean(found);
}

export async function friendIds(userId) {
  const links = await Friendship.find({ status: 'accepted', $or: [{ requester: userId }, { recipient: userId }] });
  return links.map(link => (String(link.requester) === String(userId) ? link.recipient : link.requester));
}

const Friendship = mongoose.model('Friendship', friendshipSchema);

export default Friendship;
