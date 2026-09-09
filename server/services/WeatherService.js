/**
 * WeatherService
 * Weather forecast and agricultural advisory engine.
 * Directly feeds into the PricePredictionEngine to assess supply/spoilage risks.
 */

class WeatherService {
  static getForecast(region = 'Warangal') {
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

    const forecast7d = [
      { day: 'Today', tempMax: 33, tempMin: 23, rainProbability: 20, condition: 'Sunny & Dry', icon: 'Sun' },
      { day: 'Tomorrow', tempMax: 31, tempMin: 22, rainProbability: 45, condition: 'Partly Cloudy', icon: 'CloudSun' },
      { day: 'In 2 Days', tempMax: 29, tempMin: 21, rainProbability: 75, condition: 'Scattered Showers', icon: 'CloudRain' },
      { day: 'In 3 Days', tempMax: 28, tempMin: 20, rainProbability: 60, condition: 'Overcast & Drizzle', icon: 'CloudRain' },
      { day: 'In 4 Days', tempMax: 30, tempMin: 22, rainProbability: 30, condition: 'Clearing', icon: 'CloudSun' },
      { day: 'In 5 Days', tempMax: 32, tempMin: 23, rainProbability: 15, condition: 'Sunny', icon: 'Sun' },
      { day: 'In 6 Days', tempMax: 34, tempMin: 24, rainProbability: 10, condition: 'Warm & Clear', icon: 'Sun' }
    ];

    return {
      region,
      current: {
        temp: 31,
        humidity: 62,
        windKmh: 14,
        rainProbability: 25,
        condition: 'Clear with light breeze',
        uvIndex: 7
      },
      forecast: forecast7d,
      agriAdvisories: [
        {
          priority: 'HIGH',
          crop: 'Tomato & Vegetables',
          warning: 'Monsoon showers anticipated within 48 hours (75% probability).',
          recommendation: 'Harvest mature fruits today. Complete loading or ensure waterproof tarping to prevent transit water rot.'
        },
        {
          priority: 'MEDIUM',
          crop: 'Cotton & Chilli',
          warning: 'High humidity over next 3 days may elevate storage mold risks.',
          recommendation: 'Do not spread open in yard after 3 PM. Transfer to ventilated dry shed.'
        }
      ],
      isSimulated: true,
      provider: 'AgriSethu Agrometeorological Service (IMD/OpenWeather API Ready)'
    };
  }
}

module.exports = WeatherService;
