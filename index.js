require('dotenv').config() // Load .env file
const axios = require('axios')
const Discord = require('discord.js')
const client1 = new Discord.Client()
const client2 = new Discord.Client()
const client3 = new Discord.Client()

function getNTFWorld() {


	// API for price data.
	axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.NFTWORLD_ID}`).then(res => {
		// If we got a valid response
		if(res.data && res.data[0].current_price && res.data[0].price_change_percentage_24h) {
			let currentPrice = res.data[0].current_price || 0 // Default to zero
			let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = res.data[0].symbol || '?' 
			client2.user.setPresence({
				game: {
					// Example: "Watching -5,52% | BTC"
					name: `${priceChange.toFixed(2)}% | ${symbol.toUpperCase()}`,
					type: 3 // Use activity type 3 which is "Watching"
				}
			})

			client2.guilds.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`)

			console.log('Updated price to', currentPrice)
		}
		else
			console.log('Could not load player count data for', process.env.NFTWORLD_ID)

	}).catch(err => console.log('Error at api.coingecko.com data:', err))
}

function getBlock() {


	// API for price data.
	axios.get(`https://aggregator-api.kyberswap.com/ethereum/route?tokenIn=${process.env.BLOCK_ID}&tokenOut=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&amountIn=100000000000000000000&saveGas=0&gasInclude=0`).then(res => {
		// If we got a valid response
		//console.log(res.data)
		if(res.data && res.data.tokens) {
			let tokens = res.data.tokens;
			let token = tokens[Object.keys(tokens)[0]]
			//console.log(tokens);
			let currentPrice = token.price || 0 // Default to zero
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = token.symbol || '?' 
			client1.user.setPresence({
				game: {
					// Example: "Watching -5,52% | BTC"
					name: `${symbol.toUpperCase()}`,
					type: 3 // Use activity type 3 which is "Watching"
				}
			})

			client1.guilds.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`)

			console.log('Updated price to', currentPrice)
		}
		else
			console.log('Could not load player count data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))
}

function getGas() {

	// API for price data.
	axios.get(`https://aggregator-api.kyberswap.com/ethereum/route?tokenIn=${process.env.BLOCK_ID}&tokenOut=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&amountIn=100000000000000000000&saveGas=0&gasInclude=0`).then(res => {
		// If we got a valid response
		//console.log(res.data)
		if(res.data && res.data.tokens) {
			//console.log(tokens);
			let gasPriceGwei = res.data.gasPriceGwei || 0;
			let currentPrice = res.data.gasUsd || 0 // Default to zero
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = 'gwei' 

			client3.user.setPresence({
				game: {
					// Example: "Watching -5,52% | BTC"
					name: `GAS`,
					type: 3 // Use activity type 3 which is "Watching"
				}
			})

			client3.guilds.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${(gasPriceGwei).split(".")[0].replace(/,/g,process.env.THOUSAND_SEPARATOR)} ${symbol}`)

			console.log('Updated price to', gasPriceGwei)
		}
		else
			console.log('Could not load player count data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))
}

// Runs when client connects to Discord.
client1.on('ready', () => {
	console.log('Logged in as', client1.user.tag)

	getBlock() // Ping server once on startup
	// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
	setInterval(getBlock, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

// Runs when client connects to Discord.
client2.on('ready', () => {
	console.log('Logged in as', client2.user.tag)

	getNTFWorld() // Ping server once on startup
	// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
	setInterval(getNTFWorld, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

// Runs when client connects to Discord.
client3.on('ready', () => {
	console.log('Logged in as', client3.user.tag)

	getGas() // Ping server once on startup
	// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
	setInterval(getGas, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})



// Login to Discord
client1.login(process.env.DISCORD_TOKEN_1)
client2.login(process.env.DISCORD_TOKEN_2)
client3.login(process.env.DISCORD_TOKEN_3)