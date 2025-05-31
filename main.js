const { Client } = require('@mathieuc/tradingview');

async function runBot() {
    const client = new Client({
        token: null, // Use null for free access
        signature: null
    });

    try {
        // Wait for TradingView connection
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 15000);

            client.onConnected(() => {
                console.log('✅ Connected to TradingView');
                clearTimeout(timeout);
                resolve();
            });

            client.onError((error) => {
                console.error('Connection error:', error);
                clearTimeout(timeout);
                reject(error);
            });
        });

        // Create chart session
        const chart = new client.Session.Chart();
        
        console.log('📊 Creating chart session...');

        // Set up error handling for the chart
        chart.onError((error) => {
            console.error(`❌ Chart Error: ${error.message}`);
        });

        const symbol = 'NSE:NIFTY';
        const timeframe = '1H'; // Try uppercase format

        // Alternative symbol formats to try
        const symbolAlternatives = [
            'NSE:NIFTY',
            'INDEXNSE:NIFTY_50',
            'NSE:NIFTY50',
            'INDEXNSE:NIFTY',
            'TVC:NIFTY'
        ];

        console.log(`🔄 Loading ${symbol} (NIFTY 50) on ${timeframe} timeframe...`);

        // Method 1: Try primary symbol
        let marketSet = false;
        let currentSymbol = symbol;
        
        for (const testSymbol of symbolAlternatives) {
            try {
                await chart.setMarket(testSymbol, timeframe);
                console.log(`✅ Market set successfully with symbol: ${testSymbol}`);
                currentSymbol = testSymbol;
                marketSet = true;
                break;
            } catch (error) {
                console.log(`❌ Failed with ${testSymbol}: ${error.message}`);
            }
        }
        
        if (!marketSet) {
            console.log('❌ All symbol formats failed, trying alternative methods...');
            
            // Method 2: Try with different syntax
            try {
                await chart.setMarket(symbol, {
                    timeframe: timeframe,
                    type: 'index'
                });
                console.log('✅ Market set with alternative method');
                marketSet = true;
            } catch (error2) {
                console.log('❌ Method 2 failed, trying method 3...');
                
                // Method 3: Most basic approach
                try {
                    chart.setMarket(symbol);
                    console.log('✅ Market set with basic method');
                    marketSet = true;
                } catch (error3) {
                    throw new Error(`Failed to set market with any method. Last error: ${error3.message}`);
                }
            }
        }

        // Wait for data to load
        console.log('⏳ Waiting for candle data...');
        
        let dataLoaded = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!dataLoaded && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            
            if (chart.periods && chart.periods.length > 0) {
                dataLoaded = true;
                console.log(`📈 Loaded ${chart.periods.length} candles`);
            } else {
                attempts++;
                console.log(`⏳ Attempt ${attempts}/${maxAttempts} - Still waiting for data...`);
            }
        }

        if (!dataLoaded) {
            throw new Error('Failed to load candle data after multiple attempts');
        }

        // Process the data
        const bars = chart.periods;
        console.log(`📊 Processing ${bars.length} candles...`);

        // Debug: Show sample of data structure
        if (bars.length > 0) {
            const lastBar = bars[bars.length - 1];
            console.log('Raw candle data structure:', lastBar);
            console.log('Available properties:', Object.keys(lastBar));
            
            // Try different possible property names
            const candleData = {
                time: lastBar.time || lastBar.timestamp || lastBar.t,
                open: lastBar.open || lastBar.o,
                high: lastBar.high || lastBar.h,
                low: lastBar.low || lastBar.l,
                close: lastBar.close || lastBar.c,
                volume: lastBar.volume || lastBar.vol || lastBar.v
            };
            
            console.log('Processed candle data:', candleData);
            
            if (candleData.time) {
                console.log('Candle time:', new Date(candleData.time * 1000).toISOString());
            }
        }

        // Extract price data with fallback property names
        const closes = bars.map(bar => {
            return bar.close || bar.c || bar[4]; // Try different property names
        }).filter(price => price !== undefined && price !== null);

        const highs = bars.map(bar => {
            return bar.high || bar.h || bar[2];
        }).filter(price => price !== undefined && price !== null);

        const lows = bars.map(bar => {
            return bar.low || bar.l || bar[3];
        }).filter(price => price !== undefined && price !== null);

        console.log(`📊 Extracted ${closes.length} closes, ${highs.length} highs, ${lows.length} lows`);

        // Simple Moving Average function
        function sma(data, period) {
            if (data.length < period) return null;
            const slice = data.slice(-period);
            return slice.reduce((sum, val) => sum + val, 0) / period;
        }

        // Calculate indicators with validation
        const shortMA = closes.length >= 10 ? sma(closes, 10) : null;
        const longMA = closes.length >= 50 ? sma(closes, 50) : null;
        const lastPrice = closes.length > 0 ? closes[closes.length - 1] : null;

        console.log('\n📊 NIFTY 50 Technical Analysis:');
        console.log(`Current Level: ${lastPrice?.toFixed(2) || 'N/A'}`);
        console.log(`Short MA (10): ${shortMA?.toFixed(2) || 'N/A'}`);
        console.log(`Long MA (50): ${longMA?.toFixed(2) || 'N/A'}`);
        console.log(`Total Candles: ${closes.length}`);
        console.log(`Symbol Used: ${currentSymbol}`);

        // Trading signals
        if (shortMA && longMA) {
            const difference = ((shortMA - longMA) / longMA * 100).toFixed(2);
            console.log(`MA Difference: ${difference}%`);
            
            if (shortMA > longMA) {
                console.log(`🟢 BUY SIGNAL - Short MA above Long MA`);
                console.log(`   Entry Level: ${lastPrice.toFixed(2)}`);
            } else if (shortMA < longMA) {
                console.log(`🔴 SELL SIGNAL - Short MA below Long MA`);
                console.log(`   Entry Level: ${lastPrice.toFixed(2)}`);
            } else {
                console.log(`⚪ NEUTRAL - MAs are equal`);
            }
        } else {
            console.log(`⚠️ Insufficient data for analysis`);
            console.log(`   Need at least 50 candles, have ${closes.length}`);
        }

        // Additional analysis with proper validation
        if (closes.length >= 20 && highs.length >= 20 && lows.length >= 20) {
            const recentHighs = highs.slice(-20);
            const recentLows = lows.slice(-20);
            const recentHigh = Math.max(...recentHighs);
            const recentLow = Math.min(...recentLows);
            
            if (lastPrice && recentHigh && recentLow && recentHigh !== recentLow) {
                const pricePosition = ((lastPrice - recentLow) / (recentHigh - recentLow) * 100).toFixed(1);
                
                console.log(`\n📈 Price Position (20-period): ${pricePosition}%`);
                console.log(`   Recent High: ${recentHigh.toFixed(2)}`);
                console.log(`   Recent Low: ${recentLow.toFixed(2)}`);
            }
        } else {
            console.log('\n⚠️ Insufficient data for price position analysis');
        }

    } catch (error) {
        console.error(`❌ Bot Error: ${error.message}`);
        
        // Try to get more detailed error information
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    } finally {
        console.log('🔄 Closing connection...');
        try {
            client.end();
            console.log('✅ Connection closed');
        } catch (closeError) {
            console.error('Error closing connection:', closeError.message);
        }
    }
}

// Alternative simpler approach
async function runSimpleBot() {
    const client = new Client();
    
    try {
        await new Promise((resolve) => {
            client.onConnected(() => {
                console.log('✅ Simple bot connected');
                resolve();
            });
        });

        const chart = new client.Session.Chart();
        
        // Very basic setup for NIFTY
        const niftySymbols = ['NSE:NIFTY', 'INDEXNSE:NIFTY_50', 'NSE:NIFTY50'];
        
        for (const sym of niftySymbols) {
            try {
                chart.setMarket(sym);
                console.log(`✅ Simple method using: ${sym}`);
                break;
            } catch (e) {
                console.log(`❌ Simple method failed with ${sym}`);
            }
        }
        
        // Wait and check for data
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        if (chart.periods && chart.periods.length > 0) {
            console.log(`📈 Simple method loaded ${chart.periods.length} candles`);
            
            // Debug the data structure
            const sampleBar = chart.periods[chart.periods.length - 1];
            console.log('Sample bar structure:', sampleBar);
            console.log('Available properties:', Object.keys(sampleBar));
            
            const lastPrice = sampleBar.close || sampleBar.c || sampleBar[4];
            if (lastPrice) {
                console.log(`Current BTC price: ${lastPrice}`);
            } else {
                console.log('❌ Could not extract price from candle data');
            }
        } else {
            console.log('❌ Simple method failed to load data');
        }
        
    } catch (error) {
        console.error('Simple bot error:', error.message);
    } finally {
        client.end();
    }
}

// Run the bot
console.log('🚀 Starting TradingView Bot...');
runBot()
    .then(() => {
        console.log('✅ Bot completed successfully');
    })
    .catch((error) => {
        console.error('❌ Bot failed:', error.message);
        console.log('\n🔄 Trying simple approach...');
        return runSimpleBot();
    });