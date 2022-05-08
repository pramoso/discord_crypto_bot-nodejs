const axios = require('axios');
const { ethers } = require("ethers");
const { getSecondsDiff, getTimeAgo } = require('../../utils/common');

let lastAge = '';
let paying = 1;
let symbolWrld = '';

function getValue(client) {
	// API for price data.
	axios.get(`https://api.polygonscan.com/api?module=account&action=tokentx&contractaddress=${process.env.WLRD_ADDRESS}&address=${process.env.CRYPTOSHACK_WALLET}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${process.env.POLYGON_TOKEN}`).then(async res => {
		// If we got a valid response
		if(res.data && res.data.result) {
			// Get Wrld Pool Amount
			let response = await axios.get(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${process.env.WLRD_ADDRESS}&address=${process.env.CRYPTOSHACK_WALLET}&tag=latest&apikey=${process.env.POLYGON_TOKEN}`);
			let amount = parseFloat(ethers.utils.formatEther(response.data.result)) || 0;

			// Get Timestamp of last tx
			let lastTx = res.data.result[0];
			// Calculate age of last tx
			let age = getTimeAgo(parseInt(lastTx.timeStamp * 1000));

			client.user.setActivity(
				`${age} | ${(amount).toLocaleString().replace(/,/g,process.env.THOUSAND_SEPARATOR)} ${symbolWrld}`,
				{ type: "WATCHING" }
			)

			// Calculate how many seconds since last tx
			let secondsElapsed = getSecondsDiff(parseInt(lastTx.timeStamp * 1000));

			// If it is more than 30 minutes that, send a message that no payments are going out
			if (secondsElapsed >= 1800 && lastAge != age && paying == 1) {
				lastAge = age;
				paying = 0;
				client.channels.cache.get(process.env.CS_DISCORD_CHANNEL).send(`<@&${process.env.CS_ROLE}> Último pago hace ${age}. Parece no están pagando.`);
			}

			// If is less than 60 seconds from last payment, send a message that payments are going out
			if (secondsElapsed < 60 && paying == 0) {
				paying = 1;
				client.channels.cache.get(process.env.CS_DISCORD_CHANNEL).send(`<@&${process.env.CS_ROLE}> Están volviendo a pagar. Último pago hace ${age}`);
			}

			console.log('Updated tx of getCryptoshackWorldPool', age)
			console.log('Updated amount of getCryptoshackWorldPool', amount)
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

        // Set Discord Bot Name
        client.user.setUsername('CS Payments')

        getValue(client) // Update status once on startup
        // Set the new status message every x seconds
        setInterval(getValue, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000, client)
	},
};