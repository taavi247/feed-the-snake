import { render, screen } from '@testing-library/react';
import SnakeInterface from './SnakeInterface';

test('renders learn react link', () => {
  render(<SnakeInterface />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
