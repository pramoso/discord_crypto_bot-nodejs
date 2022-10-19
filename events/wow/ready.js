const axios = require('axios');

function getValue(client) {
	// API for price data.
	axios.get(`https://sls.g2g.com/offer/search?service_id=lgc_service_1&brand_id=lgc_game_29076&region_id=dfced32f-2f0a-4df5-a218-1e068cfadffa&sort=recommended&filter_attr=lgc_29076_platform:lgc_29076_platform_41161&page_size=48&currency=USD&country=PE`).then(res => {
		// If we got a valid response
		if(res.data && res.data.payload.results) {
			let firstRow = res.data.payload.results[0];
			let currentPrice = firstRow.converted_unit_price || 0
			// let priceChange = res.data.payload.results[0].price_change_percentage_24h || 0
			// let arrow = Math.sign(priceChange) == 1 ? "⬈" : "⬊";
			// let symbol = firstRow.display_currency || '?';
			let name =  firstRow.title;			

			// set currentPrice and priceChange into status
			client.user.setActivity(
				`${process.env.CURRENCY_SYMBOL}${(currentPrice * 1000).toLocaleString(undefined, { minimumFractionDigits: 2 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`,
				{ type: "WATCHING" }
			)

			client.user.setUsername(name.toUpperCase());

			console.log('Update name of WoW to', name);

			console.log('Updated price to WoW', currentPrice);
		}
		else
			console.log('Could not load data for WoW')

	}).catch(err => console.log('Error at api data:', err))
}

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        getValue(client) // Update status once on startup
        // Set the new status message every x seconds
        setInterval(getValue, Math.max(1, process.env.UPDATE_LONG_FREQUENCY || 4) * 1000, client)
	},
};