const axios = require('axios');

let symbolWrld = '';

function getValue(client) {
	// API for price data.
	axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.WRLD_ID}`).then(res => {
		// If we got a valid response
		if(res.data && res.data[0].current_price && res.data[0].price_change_percentage_24h) {
			let currentPrice = res.data[0].current_price || 0
			let priceChange = res.data[0].price_change_percentage_24h || 0
			let symbol = res.data[0].symbol || '?' 

			// set currentPrice and priceChange into status
			client.user.setActivity(
				`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)} | ${priceChange.toFixed(2)}%`,
				{ type: "WATCHING" }
			)

			// set symbol as discord bot name
			if (symbolWrld != symbol) {
				symbolWrld = symbol;
				
				client.user.setUsername(symbol.toUpperCase())

				console.log('Update name of getWorld to', symbol)
			}			

			console.log('Updated price to getWrld', currentPrice)
		}
		else
			console.log('Could not load data for', process.env.WRLD_ID)

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