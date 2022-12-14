const axios = require('axios');
const { ethers } = require("ethers");

let symbolMatic = 'MATIC';

async function getValue(client) {
	try {
		// API for price data.
		let res = await axios.get(`https://api.polygonscan.com/api?module=account&action=balance&address=${process.env.CRYPTOSHACK_WALLET}&apikey=${process.env.POLYGON_TOKEN}`);

		// If we got a valid response
		if(res.data && res.data.result) {
			let amount = parseFloat(ethers.utils.formatEther(res.data.result)) || 0; // Default to zero
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = symbolMatic;
			
			// set currentPrice and priceChange into status
			client.user.setActivity(
				`${(amount).toLocaleString().replace(/,/g,process.env.THOUSAND_SEPARATOR)}  ${symbol}`,
				{ type: "WATCHING" }
			)

			if (amount == 0) {
				client.channels.cache.get(process.env.CS_DISCORD_CHANNEL).send(`<@&${process.env.CS_ROLE}> Ya no hay ${symbol} disponible. No se está pagando.`);
			}

			console.log('Updated price to getCryptoshackMaticPool', amount)
		}
		else
			console.log('Could not load data for', symbol)
	} catch (err) {
		console.log('Error at api data:', err)
	}
}

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        // Set Discord Bot Name
        client.user.setUsername('CS MATIC')

        getValue(client) // Update status once on startup
        // Set the new status message every x seconds
        setInterval(getValue, Math.max(1, process.env.UPDATE_LONG_FREQUENCY || 4) * 1000, client)
	},
};