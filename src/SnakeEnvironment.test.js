import { render, screen } from '@testing-library/react';
import SnakeEnvironment from './SnakeEnvironment';

test('renders learn react link', () => {
  render(<SnakeEnvironment />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
