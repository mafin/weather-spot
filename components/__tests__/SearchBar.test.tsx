import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('should render input and button', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    expect(screen.getByPlaceholderText(/enter city/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should call onSearch when form is submitted with valid input', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText(/enter city/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'Prague' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Prague');
  });

  it('should not call onSearch when input is empty', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should trim whitespace from input', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText(/enter city/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '  Prague  ' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Prague');
  });

  it('should disable input and button when loading', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);

    const input = screen.getByPlaceholderText(/enter city/i);
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should show "Searching..." text when loading', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);

    expect(screen.getByText(/searching.../i)).toBeInTheDocument();
  });
});