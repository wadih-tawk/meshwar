import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import PostCard from './PostCard.jsx';
import { apiFetch } from '../api/client.js';

vi.mock('../api/client.js', () => ({ apiFetch: vi.fn(), imageSrc: url => `http://api${url}` }));

const post = {
  id: 'p1',
  author: { id: 'u1', name: 'Bob', avatarUrl: null },
  imageUrl: '/api/images/i1?expires=1&sig=s',
  caption: '<img src=x onerror=alert(1)>',
  outing: { title: 'Beach day', place: 'Batroun', activity: 'beach' },
  hidden: false,
  mine: true,
  likeCount: 0,
  likedByMe: false,
  commentCount: 0,
  shareCount: 0,
  createdAt: new Date().toISOString(),
};

function show(props) {
  return render(
    <MemoryRouter>
      <PostCard post={{ ...post, ...props }} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  apiFetch.mockReset();
});

it('shows the caption as text, never as HTML', () => {
  const { container } = show();
  expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  expect(container.querySelectorAll('img')).toHaveLength(1);
  expect(screen.getByText(/Beach day · Batroun/)).toBeInTheDocument();
});

it('shows no owner buttons on posts of other people', () => {
  show({ mine: false });
  expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
});

it('hides my post and marks it as hidden', async () => {
  show();
  apiFetch.mockResolvedValueOnce({ ...post, hidden: true });
  await userEvent.click(screen.getByRole('button', { name: 'Hide' }));
  expect(apiFetch).toHaveBeenCalledWith('/api/posts/p1', { method: 'PUT', body: JSON.stringify({ caption: post.caption, hidden: true }) });
  expect(screen.getByText('Hidden · only you see it')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Show to everyone' })).toBeInTheDocument();
});

it('asks before deleting, then removes the post', async () => {
  show();
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(apiFetch).not.toHaveBeenCalled();
  apiFetch.mockResolvedValueOnce(null);
  await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
  expect(apiFetch).toHaveBeenCalledWith('/api/posts/p1', { method: 'DELETE' });
  expect(screen.getByText('Post deleted.')).toBeInTheDocument();
});
