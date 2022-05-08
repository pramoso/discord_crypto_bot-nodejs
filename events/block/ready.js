const axios = require('axios');

let symbolBlock = 'BLOCK';

function getValue(client) {
	// API for price data.
	let now = Math.floor(Date.now() / 1000) // timestamp in seconds, not miliseconds
	let yesterday = now - 86400; // substract 1 day in seconds

	axios.get(`https://www.dextools.io/chain-ethereum/api/Uniswap/1/pairexplorer?v=2.14.0&pair=${process.env.BLOCK_PAIR}&ts=${yesterday}-0`).then(res => {
		// If we got a valid response
		if(res.data && res.data.result) {
			// List of tokens
			let tokens = res.data.result;
			// Get first token from array which should be $block
			let token = tokens[Object.keys(tokens)[Object.keys(tokens).length - 1]];
			let currentPrice = token.price || 0;
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = token.symbol || symbolBlock;

			// set currentPrice and priceChange into status
			client.user.setActivity(
				`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`,
				{ type: "WATCHING" }
			)

			// set symbol as discord bot name
			if (symbolBlock != symbol) {
				symbolBlock = symbol;
				
				client.user.setUsername(symbol.toUpperCase())

				console.log('Update name of getBlock to', symbol)
			}			

			console.log('Updated price to getBlock', currentPrice)
		}
		else
			console.log('Could not load data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))

}

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        getValue(client) // Update status once on startup
        // Set the new status message every x seconds
        setInterval(getValue, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000, client)
	},
};