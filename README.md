# Volume Spike Tracker

A Next.js application that tracks volume spikes on Binance at different time intervals (M15, H1, H4, D1).

## Features

- Track volume spikes at different time intervals (M15, H1, H4, D1)
- Sort coins with volume spikes from high to low
- Real-time updates using Binance WebSocket API
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Axios for API requests
- Recharts for charts

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/volume-spike-tracker.git
cd volume-spike-tracker
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How It Works

The application fetches candlestick data from the Binance API for different time intervals (M15, H1, H4, D1). It then calculates the average volume over a specified number of historical candles and compares the current volume to this average. If the current volume exceeds the average by a certain threshold (e.g., 2x), it is considered a volume spike.

The application displays a list of coins with volume spikes, sorted from highest to lowest percentage increase.

## API Endpoints Used

- `/api/v3/klines` - To fetch candlestick data
- `/api/v3/exchangeInfo` - To fetch available trading pairs
- `/api/v3/ticker/24hr` - To fetch 24-hour price change information

## License

This project is licensed under the MIT License - see the LICENSE file for details.
