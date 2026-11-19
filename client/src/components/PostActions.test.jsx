import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import PostActions from './PostActions.jsx';
import { apiFetch } from '../api/client.js';

vi.mock('../api/client.js', () => ({ apiFetch: vi.fn(), imageSrc: url => url }));

const post = { id: 'p1', hidden: false, likeCount: 2, likedByMe: false, commentCount: 1, shareCount: 0 };
const comment = { id: 'c1', author: { id: 'u2', name: 'Carol', avatarUrl: null }, text: '<b>hi</b>', createdAt: new Date().toISOString(), canDelete: true };

function show(props) {
  return render(
    <MemoryRouter>
      <PostActions post={{ ...post, ...props }} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  apiFetch.mockReset();
});

it('likes and unlikes a post with the counts from the server', async () => {
  show();
  apiFetch.mockResolvedValueOnce({ likeCount: 3, likedByMe: true });
  await userEvent.click(screen.getByRole('button', { name: '♡ 2 likes' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/posts/p1/like', { method: 'PUT' });
  expect(screen.getByRole('button', { name: '♥ 3 likes' })).toHaveAttribute('aria-pressed', 'true');
  apiFetch.mockResolvedValueOnce({ likeCount: 2, likedByMe: false });
  await userEvent.click(screen.getByRole('button', { name: '♥ 3 likes' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/posts/p1/like', { method: 'DELETE' });
});

it('shows comments as text, adds one and deletes one', async () => {
  const { container } = show();
  apiFetch.mockResolvedValueOnce([comment]);
  await userEvent.click(screen.getByRole('button', { name: '💬 1 comment' }));
  expect(await screen.findByText('<b>hi</b>')).toBeInTheDocument();
  expect(container.querySelector('.comment-text b')).toBe(null);

  apiFetch.mockResolvedValueOnce({ comment: { ...comment, id: 'c2', text: 'Great view' }, commentCount: 2 });
  await userEvent.type(screen.getByLabelText('Write a comment'), 'Great view');
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/posts/p1/comments', { method: 'POST', body: '{"text":"Great view"}' });
  expect(screen.getByText('Great view')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '💬 2 comments' })).toBeInTheDocument();

  apiFetch.mockResolvedValueOnce({ commentCount: 1 });
  const first = screen.getByText('<b>hi</b>').closest('.comment');
  await userEvent.click(within(first).getByRole('button', { name: 'Delete' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/posts/p1/comments/c1', { method: 'DELETE' });
  expect(screen.queryByText('<b>hi</b>')).not.toBeInTheDocument();
});

it('shares with a chosen friend', async () => {
  show();
  apiFetch.mockResolvedValueOnce({ friends: [{ id: 'f1', name: 'Bob' }], incoming: [], outgoing: [] });
  await userEvent.click(screen.getByRole('button', { name: '↗ Share' }));
  await userEvent.selectOptions(await screen.findByLabelText('Send to a friend'), 'f1');
  apiFetch.mockResolvedValueOnce({ shareCount: 1 });
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/posts/p1/share', { method: 'POST', body: '{"friendId":"f1","note":""}' });
  expect(screen.getByText(/Sent to Bob/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '↗ Share · 1' })).toBeInTheDocument();
});

it('offers no share button on a hidden post', () => {
  show({ hidden: true });
  expect(screen.queryByRole('button', { name: /Share/ })).not.toBeInTheDocument();
});
