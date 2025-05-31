# NIFTY 50 TradingView Bot 📈

A Node.js trading bot that connects to TradingView to analyze the NIFTY 50 index using technical indicators and provides automated buy/sell signals based on moving average crossovers.

## Features ✨

- **Real-time NIFTY 50 Data**: Fetches live hourly candle data from TradingView
- **Technical Analysis**: Calculates 10-period and 50-period Simple Moving Averages
- **Trading Signals**: Generates BUY/SELL signals based on moving average crossover strategy
- **Price Position Analysis**: Shows current price position within recent 20-period range
- **Multiple Symbol Support**: Automatically tries different NIFTY symbol formats
- **Robust Error Handling**: Comprehensive error handling with fallback mechanisms
- **Detailed Logging**: Provides step-by-step execution details

## Installation 🛠️

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Setup

1. **Clone or download the bot files**

2. **Install required dependencies**:
   ```bash
   npm install @mathieuc/tradingview
   ```

3. **Run the bot**:
   ```bash
   node nifty-bot.js
   ```

## How It Works 🔍

### Trading Strategy

The bot uses a **Simple Moving Average Crossover Strategy**:

- **BUY Signal** 🟢: When 10-period MA crosses above 50-period MA
- **SELL Signal** 🔴: When 10-period MA crosses below 50-period MA
- **NEUTRAL** ⚪: When both MAs are equal

### Technical Indicators

1. **Short-term MA (10 periods)**: Captures recent price momentum
2. **Long-term MA (50 periods)**: Identifies overall trend direction
3. **Price Position**: Shows where current price sits within recent high-low range

## Sample Output 📊

```
🚀 Starting NIFTY 50 TradingView Bot...
✅ Connected to TradingView
📊 Creating chart session...
🔄 Loading NSE:NIFTY (NIFTY 50) on 1H timeframe...
✅ Market set successfully with symbol: NSE:NIFTY
📈 Loaded 156 candles

📊 NIFTY 50 Technical Analysis:
Current Level: 25,287.60
Short MA (10): 25,315.40
Long MA (50): 25,198.25
Total Candles: 156
Symbol Used: NSE:NIFTY
MA Difference: 0.46%

🟢 BUY SIGNAL - Short MA above Long MA
   Entry Level: 25,287.60

📈 NIFTY Price Position (20-period): 68.5%
   Recent High: 25,445.70
   Recent Low: 25,089.35

✅ NIFTY Bot completed successfully
```

## Symbol Formats 🔄

The bot automatically tries multiple NIFTY symbol formats:

- `NSE:NIFTY` (Primary)
- `INDEXNSE:NIFTY_50`
- `NSE:NIFTY50`
- `INDEXNSE:NIFTY`
- `TVC:NIFTY`

## Configuration Options ⚙️

You can modify these parameters in the code:

```javascript
// Trading pair and timeframe
const symbol = 'NSE:NIFTY';
const timeframe = '1H'; // Options: 1m, 5m, 15m, 30m, 1H, 4H, 1D

// Moving average periods
const shortMA = sma(closes, 10);  // Change 10 to desired short period
const longMA = sma(closes, 50);   // Change 50 to desired long period

// Price position analysis period
const recentHighs = highs.slice(-20); // Change 20 to desired lookback period
```

## Error Handling 🛡️

The bot includes comprehensive error handling:

- **Connection Timeouts**: 15-second timeout for TradingView connection
- **Data Loading**: Multiple retry attempts with 2-second intervals
- **Symbol Fallbacks**: Tries alternative symbol formats if primary fails
- **Data Validation**: Checks for undefined/null values in price data
- **Graceful Cleanup**: Properly closes connections on exit

## Data Structure Debugging 🔧

The bot automatically detects and handles different data formats:

- **Object Format**: `{open: 25200, high: 25350, low: 25180, close: 25287}`
- **Array Format**: `[timestamp, open, high, low, close, volume]`
- **Short Properties**: `{o: 25200, h: 25350, l: 25180, c: 25287}`

## Limitations ⚠️

- **Market Hours**: Works best during NSE trading hours (9:15 AM - 3:30 PM IST)
- **Data Availability**: Depends on TradingView's free data access
- **Historical Data**: Limited to available candle history from TradingView
- **No Real Trading**: This is an analysis tool only, not connected to actual trading

## Customization Ideas 💡

### Additional Indicators

```javascript
// RSI Calculation
function calculateRSI(prices, period = 14) {
    // Implementation here
}

// Bollinger Bands
function calculateBollingerBands(prices, period = 20, stdDev = 2) {
    // Implementation here
}

// MACD
function calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
    // Implementation here
}
```

### Different Timeframes

```javascript
const timeframes = ['5m', '15m', '30m', '1H', '4H', '1D'];
// Analyze multiple timeframes for confluence
```

### Risk Management

```javascript
// Add stop-loss and take-profit levels
const stopLoss = lastPrice * 0.98;    // 2% stop loss
const takeProfit = lastPrice * 1.04;  // 4% take profit
```

## Troubleshooting 🔧

### Common Issues

1. **"Connection timeout"**
   - Check internet connection
   - TradingView servers might be busy
   - Try running again after a few minutes

2. **"Invalid parameters method: create_series"**
   - Usually resolved by the multiple fallback methods
   - Check if symbol format is correct

3. **"High and low is undefined"**
   - Bot automatically handles different data formats
   - Debug output shows exact data structure

4. **No data loaded**
   - Market might be closed
   - Try different timeframes
   - Check if symbol exists on TradingView

### Debug Mode

To enable more detailed logging, modify the polling interval:

```javascript
const maxAttempts = 20; // Increase attempts
await new Promise(resolve => setTimeout(resolve, 1000)); // Reduce wait time
```

## Contributing 🤝

Feel free to enhance the bot with:

- Additional technical indicators
- Multiple timeframe analysis
- Backtesting capabilities
- Alert systems (email, SMS, webhook)
- Portfolio management features

## Disclaimer ⚖️

This bot is for educational and analysis purposes only. It does not provide financial advice. Always do your own research and consult with financial advisors before making investment decisions. Past performance does not guarantee future results.

## License 📄

This project is open source and available under the MIT License.

---

**Happy Trading! 🚀📈**

*Remember: The best strategy is the one you understand and can stick to consistently.*
