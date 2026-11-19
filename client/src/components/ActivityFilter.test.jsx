import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import ActivityFilter from './ActivityFilter.jsx';

const outings = [{ activity: 'hike' }, { activity: 'beach' }, { activity: 'hike' }];

it('shows a chip only for the activities the user has', () => {
  render(<ActivityFilter outings={outings} selected="all" onSelect={() => {}} />);
  expect(screen.getByRole('button', { name: /hike/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /beach/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /ski/i })).not.toBeInTheDocument();
});

it('tells the page which activity was picked', async () => {
  const onSelect = vi.fn();
  render(<ActivityFilter outings={outings} selected="all" onSelect={onSelect} />);
  await userEvent.click(screen.getByRole('button', { name: /beach/i }));
  expect(onSelect).toHaveBeenCalledWith('beach');
});
