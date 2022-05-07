require('dotenv').config() // Load .env file
const axios = require('axios')
const cheerio = require('cheerio');
const { Client, Intents, MessageEmbed } = require('discord.js')
const { ethers } = require("ethers");
const wallets = require('./discord-wallets.json')

const clientBlock = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientWrld = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientGas = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientWrldPool = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientMaticPool = new Client({ intents: [Intents.FLAGS.GUILDS] });

let lastAge = '';
let paying = 1;
let symbolWrld = '';
let symbolBlock = '';
let symbolMatic = '';
let symbolGas = 'gwei';
let emptyWrld = 0;
let emptyMatic = 0;

const rtf = new Intl.RelativeTimeFormat({
	localeMatcher: 'best fit', // otros valores: 'lookup'
	numeric: 'always', // otros valores: 'auto' para poner "ayer" o "anteayer"
	style: 'long', // otros valores: 'short' o 'narrow'
});

const getSecondsDiff = (timestamp) => {
	// restamos el tiempo actual al que le pasamos por parámetro
	// lo dividimos entre 1000 para quitar los milisegundos
	return (Date.now() - timestamp) / 1000
}

const DATE_UNITS = {
	day: 86400,
	hour: 3600,
	minute: 60,
	second: 1 // un segundo tiene... un segundo :D
}

const getUnitAndValueDate = (secondsElapsed) => {
	// creamos un for of para extraer cada unidad y los segundos en esa unidad del diccionario
	for (const [unit, secondsInUnit] of Object.entries(DATE_UNITS)) {
		// si los segundos que han pasado entre las fechas es mayor a los segundos
		// que hay en la unidad o si la unidad es "second"...
		if (secondsElapsed >= secondsInUnit || unit === "second") {
		// extraemos el valor dividiendo el tiempo que ha pasado en segundos
		// con los segundos que tiene la unidad y redondeamos la unidad
		// ej: 3800 segundos pasados / 3600 segundos (1 hora) = 1.05 horas
		// Math.floor(1.05) -> 1 hora
		// finalmente multiplicamos por -1 ya que necesitamos
		// la diferencia en negativo porque, como hemos visto antes,
		// así nos indicará el "Hace ..." en lugar del "Dentro de..."
		const value = Math.floor(secondsElapsed / secondsInUnit) * -1
		// además del valor también tenemos que devolver la unidad
		return { value, unit }
		}
	}
}
	
const getTimeAgo = timestamp => {
	// creamos una instancia de RelativeTimeFormat para traducir en castellano
	const rtf = new Intl.RelativeTimeFormat()
	// recuperamos el número de segundos de diferencia entre la fecha que pasamos
	// por parámetro y el momento actual
	const secondsElapsed = getSecondsDiff(timestamp)
	// extraemos la unidad de tiempo que tenemos que usar
	// para referirnos a esos segundos y el valor
	const {value, unit} = getUnitAndValueDate(secondsElapsed)
	// formateamos el tiempo relativo usando esos dos valores
	return rtf.format(value, unit)
  }

function getBlock() {
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
			clientBlock.user.setActivity(
				`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`,
				{ type: "WATCHING" }
			)

			// set symbol as discord bot name
			if (symbolBlock != symbol) {
				symbolBlock = symbol;
				
				clientBlock.guilds.cache
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

function getWrld() {
	// API for price data.
	axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.WRLD_ID}`).then(res => {
		// If we got a valid response
		if(res.data && res.data[0].current_price && res.data[0].price_change_percentage_24h) {
			let currentPrice = res.data[0].current_price || 0
			let priceChange = res.data[0].price_change_percentage_24h || 0
			let symbol = res.data[0].symbol || '?' 

			// set currentPrice and priceChange into status
			clientWrld.user.setActivity(
				`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)} | ${priceChange.toFixed(2)}%`,
				{ type: "WATCHING" }
			)

			// set symbol as discord bot name
			if (symbolWrld != symbol) {
				symbolWrld = symbol;
				
				clientWrld.guilds.cache
				.find(guild => guild.id === process.env.SERVER_ID)
				.me.setNickname(symbol.toUpperCase())

				console.log('Update name of getWorld to', symbol)
			}			

			console.log('Updated price to getWrld', currentPrice)
		}
		else
			console.log('Could not load data for', process.env.WRLD_ID)

	}).catch(err => console.log('Error at api data:', err))
}

function getGas() {
	// API for price data.
	axios.get(`https://aggregator-api.kyberswap.com/ethereum/route?tokenIn=${process.env.BLOCK_ID}&tokenOut=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&amountIn=100000000000000000000&saveGas=0&gasInclude=0`).then(res => {
		// If we got a valid response
		if(res.data && res.data.tokens) {
			//console.log(tokens);
			let currentPriceGwei = res.data.gasPriceGwei || 0;
			let currentPriceUsd = res.data.gasUsd || 0;
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = 'gwei';
		
			// set currentPrice and priceChange into status
			clientGas.user.setActivity(
				`${(currentPriceGwei).split(".")[0].replace(/,/g,process.env.THOUSAND_SEPARATOR)} ${symbol} | ${process.env.CURRENCY_SYMBOL}${(currentPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`,
				{ type: "WATCHING" }
			)

			console.log('Updated price to getGas', currentPriceGwei);
		}
		else
			console.log('Could not load data for', symbol);

	}).catch(err => console.log('Error at api data:', err))
}

function getCryptoshackWorldPool() {
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

			clientWrldPool.user.setActivity(
				`${age} | ${(amount).toLocaleString().replace(/,/g,process.env.THOUSAND_SEPARATOR)} ${symbolWrld}`,
				{ type: "WATCHING" }
			)

			// Calculate how many seconds since last tx
			let secondsElapsed = getSecondsDiff(parseInt(lastTx.timeStamp * 1000));

			// If it is more than 30 minutes that, send a message that no payments are going out
			if (secondsElapsed >= 1800 && lastAge != age && paying == 1) {
				lastAge = age;
				paying = 0;
				clientWrldPool.channels.cache.get('971411187537424394').send(`<@&971415355895468074> Último pago hace ${age}. Parece no están pagando.`);
			}

			// If is less than 60 seconds from last payment, send a message that payments are going out
			if (secondsElapsed < 60 && paying == 0) {
				paying = 1;
				clientWrldPool.channels.cache.get('971411187537424394').send(`<@&971415355895468074> Están volviendo a pagar. Último pago hace ${age}`);
			}

			console.log('Updated tx of getCryptoshackWorldPool', age)
			console.log('Updated amount of getCryptoshackWorldPool', amount)
		}
		else
			console.log('Could not load data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))
}

function getCryptoshackMaticPool() {
	// API for price data.
	axios.get(`https://api.polygonscan.com/api?module=account&action=balance&address=${process.env.CRYPTOSHACK_WALLET}&apikey=${process.env.POLYGON_TOKEN}`).then(res => {
		// If we got a valid response
		if(res.data && res.data.result) {
			let amount = parseFloat(ethers.utils.formatEther(res.data.result)) || 0; // Default to zero
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = 'MATIC' 
			
			// set currentPrice and priceChange into status
			clientMaticPool.user.setActivity(
				`${(amount).toLocaleString().replace(/,/g,process.env.THOUSAND_SEPARATOR)}  ${symbol}`,
				{ type: "WATCHING" }
			)

			console.log('Updated price to getCryptoshackMaticPool', amount)
		}
		else
			console.log('Could not load data for', symbol)

	}).catch(err => console.log('Error at api data:', err))
}

// Runs when client connects to Discord.
clientBlock.on('ready', () => {
	console.log('Logged in as', clientBlock.user.tag)

	getBlock() // Update status once on startup
	// Set the new status message every x seconds
	setInterval(getBlock, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

// Runs when client connects to Discord.
clientWrld.on('ready', () => {
	console.log('Logged in as', clientWrld.user.tag)

	getWrld() // Update status once on startup
	// Set the new status message every x seconds
	setInterval(getWrld, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

// Runs when client connects to Discord.
clientGas.on('ready', () => {
	console.log('Logged in as', clientGas.user.tag)

	clientGas.guilds.cache
		.find(guild => guild.id === process.env.SERVER_ID)
		.me.setNickname('Gas Tracker')

	getGas() // Update status once on startup 
	// Set the new status message every x seconds
	setInterval(getGas, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

// Runs when client connects to Discord.
clientWrldPool.on('ready', () => {
	console.log('Logged in as', clientWrldPool.user.tag)

	clientWrldPool.guilds.cache
		.find(guild => guild.id === process.env.SERVER_ID)
		.me.setNickname('CS Payments')

	getCryptoshackWorldPool() // Update status once on startup
	// Set the new status message every x seconds
	setInterval(getCryptoshackWorldPool, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

// Runs when client connects to Discord.
clientMaticPool.on('ready', () => {
	console.log('Logged in as', clientMaticPool.user.tag)

	clientMaticPool.guilds.cache
		.find(guild => guild.id === process.env.SERVER_ID)
		.me.setNickname('CS MATIC')

	getCryptoshackMaticPool() // Update status once on startup
	// Set the new status message every x seconds
	setInterval(getCryptoshackMaticPool, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

clientBlock.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	} else if (commandName === 'time') {
		const userWallet = wallets[interaction.user.tag];
		await interaction.deferReply();
		const res = await axios.get(`https://server-dxhfx4osrq-ue.a.run.app/block/reward/${userWallet}`);
		var userBlocks = res.data.playReward || 0;
		axios.get(`https://www.critterztracker.com/${userWallet}`)
			.then(async response => {
				const $ = cheerio.load(response.data);
				const userInfo = $('script:not([src])')[0].children[0].data
				const time = JSON.parse(userInfo.match(/timePerEpoch":(\[.*?\])/)[1]);
				const staked = JSON.parse(userInfo.match(/,"staked":(\[.*?\])/)[1]);
				console.log(staked)
				console.log('Success:', time);
				var d = new Date();

				const userReport = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Registro de tiempos')
					.setURL(`https://www.critterztracker.com/${userWallet}`)
					//.setAuthor({ name: 'proc', iconURL: 'https://i.imgur.com/HqdTrxJ.png', url: 'https://discord.js.org' })
					.setDescription(`<@${interaction.user.id}> estos son tus tiempos registrados en los últimos días`)
					.setThumbnail('https://i.imgur.com/ZccgsMC.jpeg')
					.addFields(
						//{ name: 'Regular field title', value: 'Some value here' },
						//{ name: '\u200B', value: '\u200B' },
						{ name: `Hoy`, value: `${time[0]} minutos.`, inline: true },
						{ name: `Ayer`, value: `${time[1]} minutos.`, inline: true },
						{ name: `Hace 3 días`, value: `${time[2]} minutos.`, inline: true },
					)
					.addFields(
						//{ name: 'Regular field title', value: 'Some value here' },
						//{ name: '\u200B', value: '\u200B' },
						{ name: `Hace 4 días`, value: `${time[3]} minutos.`, inline: true },
						{ name: `Hace 5 días`, value: `${time[4]} minutos.`, inline: true },
						{ name: `Hace 6 días`, value: `${time[5]} minutos.`, inline: true },
					)
					.addField('Blocks acumulados', `${parseFloat(userBlocks).toFixed(2)} $block`, true)
					.addField('Critterz asignados', `${staked.length}`, true)
					//.setImage('https://i.imgur.com/AfFp7pu.png')
					.setTimestamp()
					.setFooter({ text: 'Bot para Critterz', iconURL: 'https://i.imgur.com/ZccgsMC.jpeg' });


				//clientBlock.channels.cache.get('971975505458909205').send({ embeds: [userReport] });				
				await interaction.editReply({ embeds: [userReport] })
			})
			.catch((error) => {
				console.error('Error:', error);
			});
		
		}
});

// Login to Discord
clientBlock.login(process.env.DISCORD_TOKEN_1)
clientWrld.login(process.env.DISCORD_TOKEN_2)
clientGas.login(process.env.DISCORD_TOKEN_3)
clientWrldPool.login(process.env.DISCORD_TOKEN_4)
clientMaticPool.login(process.env.DISCORD_TOKEN_5)