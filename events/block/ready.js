const axios = require('axios');

let symbolBlock = '';

function getValue(client) {
	// API for price data.
	axios.get(`https://aggregator-api.kyberswap.com/ethereum/route?tokenIn=${process.env.BLOCK_ID}&tokenOut=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&amountIn=100000000000000000000&saveGas=0&gasInclude=0`).then(res => {
		// If we got a valid response
		if(res.data && res.data.tokens) {
			// List of tokens
			let tokens = res.data.tokens;
			// Get first token from array which should be $block
			let token = tokens[Object.keys(tokens)[0]]
			let currentPrice = token.price || 0
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = token.symbol || '?' 

			// set currentPrice and priceChange into status
			client.user.setActivity(
				`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`,
				{ type: "WATCHING" }
			)

			// set symbol as discord bot name
			if (symbolBlock != symbol) {
				symbolBlock = symbol;
				
				client.guilds.cache
				.find(guild => guild.id === process.env.SERVER_ID)
				.me.setNickname(symbol.toUpperCase())

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