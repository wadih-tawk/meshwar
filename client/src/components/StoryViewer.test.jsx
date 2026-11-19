import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import StoryViewer from './StoryViewer.jsx';
import { apiFetch } from '../api/client.js';

vi.mock('../api/client.js', () => ({ apiFetch: vi.fn(), imageSrc: url => url }));

const person = { id: 'u1', name: 'Bob', avatarUrl: null };
const now = new Date().toISOString();
const stories = [
  { id: 's1', imageUrl: '/a', caption: 'First <b>one</b>', mine: true, createdAt: now },
  { id: 's2', imageUrl: '/b', caption: 'Second', mine: true, createdAt: now },
];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
  apiFetch.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

it('moves to the next story by itself after 5 seconds, then closes', async () => {
  const onClose = vi.fn();
  apiFetch.mockResolvedValueOnce(stories);
  render(<StoryViewer person={person} onClose={onClose} />);
  expect(await screen.findByText('First <b>one</b>')).toBeInTheDocument();
  await act(async () => {});
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(screen.getByText('Second')).toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(onClose).toHaveBeenCalled();
});

it('goes back and forth with the arrow keys and closes with Escape', async () => {
  const onClose = vi.fn();
  apiFetch.mockResolvedValueOnce(stories);
  render(<StoryViewer person={person} onClose={onClose} />);
  await screen.findByText('First <b>one</b>');
  await act(async () => {});
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  expect(screen.getByText('Second')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  expect(screen.getByText('First <b>one</b>')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onClose).toHaveBeenCalled();
});

it('pauses while I decide to delete my story, then deletes it', async () => {
  const onChange = vi.fn();
  apiFetch.mockResolvedValueOnce(stories);
  render(<StoryViewer person={person} onClose={vi.fn()} onChange={onChange} />);
  await screen.findByText('First <b>one</b>');
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'Delete…' }));
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  expect(screen.getByText('First <b>one</b>')).toBeInTheDocument();
  apiFetch.mockResolvedValueOnce(null);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Delete story' }));
  });
  expect(apiFetch).toHaveBeenLastCalledWith('/api/stories/s1', { method: 'DELETE' });
  expect(screen.getByText('Second')).toBeInTheDocument();
  expect(onChange).toHaveBeenCalled();
});

it('keeps keyboard focus inside the viewer', async () => {
  apiFetch.mockResolvedValueOnce(stories);
  render(<StoryViewer person={person} onClose={vi.fn()} />);
  await screen.findByText('First <b>one</b>');
  await act(async () => {});
  const close = screen.getByRole('button', { name: 'Close stories' });
  expect(document.activeElement).toBe(close);
  screen.getByRole('button', { name: 'Delete…' }).focus();
  fireEvent.keyDown(window, { key: 'Tab' });
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete…' }));
});
