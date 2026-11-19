import { imageUrl } from './images/photos.js';

export function personView(user) {
  return { id: user._id, name: user.name, avatarUrl: imageUrl(user.avatarId) };
}

export function postView(post, me) {
  return {
    id: post._id,
    author: personView(post.author),
    imageUrl: imageUrl(post.image),
    caption: post.caption,
    outing: post.outing,
    hidden: post.hidden,
    mine: String(post.author._id) === String(me),
    likeCount: post.likes.length,
    likedByMe: post.likes.some(id => String(id) === String(me)),
    commentCount: post.commentCount,
    shareCount: post.shareCount,
    createdAt: post.createdAt,
  };
}
