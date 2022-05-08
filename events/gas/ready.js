const axios = require('axios');

let symbolGas = 'gwei';

function getValue(client) {
	// API for price data.
	axios.get(`https://aggregator-api.kyberswap.com/ethereum/route?tokenIn=${process.env.BLOCK_ID}&tokenOut=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&amountIn=100000000000000000000&saveGas=0&gasInclude=0`).then(res => {
		// If we got a valid response
		if(res.data && res.data.tokens) {
			//console.log(tokens);
			let currentPriceGwei = res.data.gasPriceGwei || 0;
			let currentPriceUsd = res.data.gasUsd || 0;
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = symbolGas;
		
			// set currentPrice and priceChange into status
			client.user.setActivity(
				`${(currentPriceGwei).split(".")[0].replace(/,/g,process.env.THOUSAND_SEPARATOR)} ${symbol} | ${process.env.CURRENCY_SYMBOL}${(currentPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`,
				{ type: "WATCHING" }
			)

			console.log('Updated price to getGas', currentPriceGwei);
		}
		else
			console.log('Could not load data for', symbol);

	}).catch(err => console.log('Error at api data:', err))
}

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        // Set Discord Bot Name
        client.user.setUsername('Gas Tracker')

        getValue(client) // Update status once on startup
        // Set the new status message every x seconds
        setInterval(getValue, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000, client)
	},
};