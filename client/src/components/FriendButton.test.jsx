import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import FriendButton from './FriendButton.jsx';
import { apiFetch } from '../api/client.js';

vi.mock('../api/client.js', () => ({ apiFetch: vi.fn() }));

beforeEach(() => {
  apiFetch.mockReset();
});

it('sends a request, then lets me cancel it', async () => {
  apiFetch.mockResolvedValueOnce({ status: 'none' });
  render(<FriendButton personId="p1" />);
  apiFetch.mockResolvedValueOnce({ status: 'sent', requestId: 'r1' });
  await userEvent.click(await screen.findByRole('button', { name: '+ Add friend' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/friends/requests', { method: 'POST', body: '{"userId":"p1"}' });
  expect(screen.getByText('Request sent')).toBeInTheDocument();
  apiFetch.mockResolvedValueOnce(null);
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/friends/requests/r1', { method: 'DELETE', body: undefined });
  expect(screen.getByRole('button', { name: '+ Add friend' })).toBeInTheDocument();
});

it('accepts a request I received', async () => {
  apiFetch.mockResolvedValueOnce({ status: 'received', requestId: 'r2' });
  render(<FriendButton personId="p2" />);
  apiFetch.mockResolvedValueOnce({ status: 'friends', requestId: 'r2' });
  await userEvent.click(await screen.findByRole('button', { name: 'Accept request' }));
  expect(apiFetch).toHaveBeenLastCalledWith('/api/friends/requests/r2/accept', { method: 'POST', body: undefined });
  expect(screen.getByText('✓ Friends')).toBeInTheDocument();
});

it('shows the server error and keeps the buttons', async () => {
  apiFetch.mockResolvedValueOnce({ status: 'none' });
  render(<FriendButton personId="p3" />);
  apiFetch.mockRejectedValueOnce(new Error('Too many friend requests, try again in an hour'));
  await userEvent.click(await screen.findByRole('button', { name: '+ Add friend' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Too many friend requests');
  expect(screen.getByRole('button', { name: '+ Add friend' })).toBeInTheDocument();
});
