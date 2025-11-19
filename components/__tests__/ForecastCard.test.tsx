import { render, screen } from '@testing-library/react';
import ForecastCard from '../ForecastCard';

describe('ForecastCard', () => {
  const mockProps = {
    date: '2024-01-15',
    tempMax: 25,
    tempMin: 15,
    weatherCode: 0
  };

  it('should render weather information', () => {
    render(<ForecastCard {...mockProps} />);

    // Should display the average temperature
    expect(screen.getByText('20°C')).toBeInTheDocument();

    // Should display min/max temperatures
    expect(screen.getByText('15° / 25°')).toBeInTheDocument();

    // Should display weather description
    expect(screen.getByText('Clear sky')).toBeInTheDocument();
  });

  it('should display correct weather icon', () => {
    render(<ForecastCard {...mockProps} />);

    // Check for the sun emoji icon (weather code 0 = clear sky)
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<ForecastCard {...mockProps} />);

    // 2024-01-15 is a Monday
    expect(screen.getByText(/mon/i)).toBeInTheDocument();
  });

  it('should round temperatures to nearest integer', () => {
    const props = {
      date: '2024-01-15',
      tempMax: 25.7,
      tempMin: 15.3,
      weatherCode: 1
    };

    render(<ForecastCard {...props} />);

    // Average of 25.7 and 15.3 is 20.5, should round to 21
    expect(screen.getByText('21°C')).toBeInTheDocument();
    expect(screen.getByText('15° / 26°')).toBeInTheDocument();
  });

  it('should handle different weather codes', () => {
    const rainyProps = {
      ...mockProps,
      weatherCode: 63 // Moderate rain
    };

    render(<ForecastCard {...rainyProps} />);

    expect(screen.getByText('Moderate rain')).toBeInTheDocument();
    expect(screen.getByText('🌧️')).toBeInTheDocument();
  });
});