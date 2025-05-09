import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'
import Home from '../pages/Home';

test('renders header', () => {
  render(
    <BrowserRouter    
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Home />
    </BrowserRouter>
  );
  const logo = screen.getByText(/mini lab/i);
  expect(logo).toBeInTheDocument();
});
