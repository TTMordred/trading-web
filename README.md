# Volume Spike Tracker

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A professional Next.js application that identifies and tracks volume spikes on Binance cryptocurrency exchange across multiple timeframes. This tool helps traders identify unusual trading activity that might indicate potential price movements.

![Volume Spike Tracker](https://via.placeholder.com/800x400?text=Volume+Spike+Tracker)

## Overview

Volume Spike Tracker monitors trading activity on Binance and detects when a cryptocurrency's trading volume significantly exceeds its historical average. The application provides real-time data visualization and sorting capabilities to help traders quickly identify the most significant volume anomalies.

## Key Features

- **Multi-timeframe Analysis**: Track volume spikes at different time intervals (15m, 1h, 4h, 1d)
- **Intelligent Sorting**: Automatically sorts cryptocurrencies with volume spikes from highest to lowest percentage increase
- **Real-time Updates**: Continuously refreshes data using Binance WebSocket API
- **Responsive Design**: Fully responsive interface built with Tailwind CSS
- **Interactive Charts**: Visual representation of volume spikes using Recharts
- **Detailed Metrics**: View current volume, average volume, percentage increase, price, and 24h change

## Technology Stack

- **Frontend Framework**: Next.js 14.x with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **API Integration**: Axios for HTTP requests
- **Data Visualization**: Recharts for interactive charts
- **Real-time Updates**: Binance WebSocket API

## Volume Spike Detection Logic

The application uses a sophisticated algorithm to detect volume spikes. For a detailed explanation of how the volume spike detection works, please refer to the [Volume Spike Logic Documentation](./volume-spike-logic-vi.md) (Vietnamese).

In summary, a volume spike is detected when the current trading volume is at least double (2x) the average volume of the previous 20 candles. The higher the ratio between current volume and average volume, the more significant the spike.

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn package manager

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

## API Integration

The application integrates with the following Binance API endpoints:

- `/api/v3/klines` - To fetch candlestick data for volume analysis
- `/api/v3/exchangeInfo` - To retrieve available trading pairs
- `/api/v3/ticker/24hr` - To obtain 24-hour price change information

## Deployment

To build the application for production:

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
