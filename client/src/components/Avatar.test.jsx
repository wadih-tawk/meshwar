import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import Avatar from './Avatar.jsx';

it('shows initials when there is no photo', () => {
  render(<Avatar name="Raymond El-Helou" url={null} />);
  expect(screen.getByRole('img', { name: 'Raymond El-Helou' })).toHaveTextContent('RE');
});

it('shows the photo from the API when there is one', () => {
  render(<Avatar name="Alex Achkar" url="/api/images/abc?expires=1&sig=x" />);
  expect(screen.getByRole('img', { name: 'Alex Achkar' }).getAttribute('src')).toContain('/api/images/abc');
});
