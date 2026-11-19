import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import PhotoGallery from './PhotoGallery.jsx';

const photos = [
  { src: 'https://example.org/a.jpg', author: 'Ana', license: 'CC0', page: 'https://example.org/a' },
  { src: 'https://example.org/b.jpg', author: 'Bob', license: 'CC BY 4.0', page: 'https://example.org/b' },
];

it('shows the first photo with its credit, and switches when a thumbnail is clicked', async () => {
  render(<PhotoGallery photos={photos} title="Byblos" />);
  expect(screen.getByAltText('Byblos, photo 1 of 2')).toHaveAttribute('src', 'https://example.org/a.jpg');
  expect(screen.getByRole('link', { name: 'Ana' })).toHaveAttribute('href', 'https://example.org/a');
  await userEvent.click(screen.getByRole('button', { name: 'Show photo 2' }));
  expect(screen.getByAltText('Byblos, photo 2 of 2')).toHaveAttribute('src', 'https://example.org/b.jpg');
  expect(screen.getByText(/CC BY 4.0/)).toBeInTheDocument();
});
