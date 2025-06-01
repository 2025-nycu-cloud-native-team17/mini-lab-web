import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Components/Header';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));
// ✅ Mock AuthContext
const mockUseAuth = require('../contexts/AuthContext').useAuth;

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ accessToken: 'token' });
});

function renderHeader() {
    return render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
    );
}

test('renders header with profile icon', () => {
    renderHeader();
    expect(screen.getByAltText(/profile/i)).toBeInTheDocument();
});

test('toggles sidebar menu and closes on backdrop', () => {
    renderHeader();

    fireEvent.click(screen.getByAltText(/menu/i));
    expect(screen.getByText('功能列表')).toBeInTheDocument();

    const backdrop = screen.getByTestId('sidebar-backdrop');
    fireEvent.click(backdrop);

    const sidebar = document.querySelector('div[class*="translate-"]');
    expect(sidebar.className).toMatch(/-translate-x-full/);
});

test('clicking sidebar link closes menu', () => {
    renderHeader();

    fireEvent.click(screen.getByAltText(/menu/i));
    fireEvent.click(screen.getByText('Member'));

    const sidebar = document.querySelector('div[class*="translate-"]');
    expect(sidebar.className).toMatch(/-translate-x-full/);
});
