require('dotenv').config() // Load .env file
const axios = require('axios')
const cheerio = require('cheerio');
const { Client, Intents, MessageEmbed } = require('discord.js')
const { ethers } = require("ethers");

const client1 = new Client({ intents: [Intents.FLAGS.GUILDS] });
const client2 = new Client({ intents: [Intents.FLAGS.GUILDS] });
const client3 = new Client({ intents: [Intents.FLAGS.GUILDS] });
const client4 = new Client({ intents: [Intents.FLAGS.GUILDS] });
const client5 = new Client({ intents: [Intents.FLAGS.GUILDS] });

let lastAge = '';
let paying = 1;
let emptyWrld = 0;
let emptyMatic = 0;

const wallets = {
	"proc#3096": "0xe880E082A0DD7F6423A4834E55c08527361f733c",
	"(Carlos)#4157": "0xe880E082A0DD7F6423A4834E55c08527361f733c",
	"KmikZE#3498": "0xf7d541E8436e638f94D828a1ea7B1521598b8BBA",
	"carro#7692": "0x98Af0335E44A9857Af5bd2eEFbe32c840FeC6fce",
	"Yasan#7539": "0x18133D9de05730Dd628Ca2A4dEd611d7db9528e3",
	"Oganba#0103": "0x13D24D484b643E2562557F0B6d3c04718c05ec58",
	"Orejas#3052": "0xCbD6acb60BC2b480f155619116f630b3a71BfA35",
	"Acolastin#8913": "0x1AdbA122cC2D161B34B7643E0B7808E2e2De80Fe",
	"espada12#3809": "0xDE36E7979f9d0964a44E6cb2f75454414A87165a",
	"TeamBuraka#0784": "0x4f1B6705122486Dfe5b9e7f20a1C3841D4cfa5Af",
	"Morocha#0277": "0x7c1795E8ED16Dd5220fE8Ec00B5B6F2E6a9F12BA",
	"inu#7035": "0x14d7233Bf329e06f01197f3B86014A6cDD79D0C7",
	"Andreina Gimenez#4284": "0xBa756f821eD0C87763E3Bb2A6FB8dADd51Ea6E99",
	"luisangel36#4123": "0xF65ED33EE022bD93EC0bC943A04f2101e4B994Ed",
	"Jota#7947": "0x739644eF3FCD33a1afD02B9d0Be623B0F1ED5E0F",
	"victorfinol#7842": "0x2339b35Ed2A0ba8689ad6D1b5f91774fED5db549",
	"Zambra#7522": "0x35137b8f5b42297aFBa6572C2Ff8BD3d7aadA411",
	"Lisbug#1065": "0x99d5620b0D4693149FDd697F63ec0e7Ad8Df5387",
	"EpicGamesxD#2202": "0x05b2e494f6b6D325f321a5c88A8E551687759159",
	"caraota_frita#4937": "0x7Ea43871E0A75968F69362E999C8B8EB6d3B3fF5",
	"stevendres#3311": "0x2BD0Fa83ed3d0005b87Af9aFe14a3455cE6E6522",
	"elenmarmol#1553": "0xeCEf7EabAe4EF6808f4615B9c1EE22FDE8D14c23",
	"Ara#3938": "0x5E8ec13d880031302B92Cd0E1b81a2125CEc7FA7",
	"MasterLokyOp#5503": "0x5e23FcFb0Cc97585b92608f856CB4F95e207A1a8",
	"KaptoChan#3268": "0xe79913E1c042CE461A6791e97841633a3F40BAaF",
	"SandraCo#8646": "0xb3B509A5C030c172ab20B6e18ECaff581b93A7d9",
	"Zukarito#6450": "0xA89A5f140Cf860B7808ff940F4Ce5737E1f508b0",
	"Miguel Morales#2314": "0x953945E4ec7aB8B73DD6449d866518a23398c720"
}

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

function getNTFWorld() {


	// API for price data.
	axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.NFTWORLD_ID}`).then(res => {
		// If we got a valid response
		if(res.data && res.data[0].current_price && res.data[0].price_change_percentage_24h) {
			let currentPrice = res.data[0].current_price || 0 // Default to zero
			let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = res.data[0].symbol || '?' 
			client2.user.setActivity(
				`${priceChange.toFixed(2)}% | ${symbol.toUpperCase()}`,
				{ type: "WATCHING" }
			)

			client2.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`)

			console.log('Updated price to getNTFWorld', currentPrice)
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

			client1.user.setActivity(
				`${symbol.toUpperCase()}`,
				{ type: "WATCHING" }
			)

			client1.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 6 }).replace(/,/g,process.env.THOUSAND_SEPARATOR)}`)

			console.log('Updated price to getBlock', currentPrice)
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

			client3.user.setActivity(
				`GAS`,
				{ type: "WATCHING" }
			)

			client3.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${(gasPriceGwei).split(".")[0].replace(/,/g,process.env.THOUSAND_SEPARATOR)} ${symbol}`)

			console.log('Updated price to getGas', gasPriceGwei)
		}
		else
			console.log('Could not load player count data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))
}

function getCryptoshackWorldPool() {

	// API for price data.
	axios.get(`https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0xD5d86FC8d5C0Ea1aC1Ac5Dfab6E529c9967a45E9&address=0x772b326d89fd0c74e7d42e402d2e4bf58d432440&tag=latest&apikey=ZSJ5QYP9EMWA89RG1F9PBPKUCR9UYV4YVR`).then(res => {
		// If we got a valid response
		//console.log(res.data)
		if(res.data && res.data.result) {
			//console.log(tokens);
			let amount = parseFloat(ethers.utils.formatEther(res.data.result)) || 0; // Default to zero
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = 'WRLD' 

			/* client4.user.setPresence({
				game: {
					// Example: "Watching -5,52% | BTC"
					name: `POOL WRLD`,
					type: 3 // Use activity type 3 which is "Watching"
				}
			}) */

			client4.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${(amount).toLocaleString().replace(/,/g,process.env.THOUSAND_SEPARATOR)} ${symbol}`)
			console.log('Updated price to getCryptoshackWorldPool', amount)
		}
		else
			console.log('Could not load player count data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))

	// API for price data.
	axios.get(`https://api.polygonscan.com/api?module=account&action=tokentx&contractaddress=0xD5d86FC8d5C0Ea1aC1Ac5Dfab6E529c9967a45E9&address=0x772b326d89fd0c74e7d42e402d2e4bf58d432440&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=ZSJ5QYP9EMWA89RG1F9PBPKUCR9UYV4YVR`).then(res => {
		// If we got a valid response
		//console.log(res.data)
		if(res.data && res.data.result) {
			//console.log(res.data);
			let lastTx = res.data.result[0]; // Default to zero
			let age = getTimeAgo(parseInt(lastTx.timeStamp * 1000));
			
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero

			client4.user.setActivity(
				`${age} | POOL`,
				{ type: "WATCHING" }
			)

			// Send a basic message
			//console.log(age);
			let secondsElapsed = getSecondsDiff(parseInt(lastTx.timeStamp * 1000));
			if (secondsElapsed >= 1800 && lastAge != age && paying == 1) {
				lastAge = age;
				paying = 0;
				//client4.channels.cache.get('971411187537424394').send(`<@&971415355895468074> Último pago hace ${age}. Parece no están pagando.`);
			}
			if (secondsElapsed < 60 && paying == 0) {
				paying = 1;
				client4.channels.cache.get('971411187537424394').send(`<@&971415355895468074> Están volviendo a pagar. Último pago hace ${age}`);
			}
			
			//client4.user.setActivity(` ${age} | XXX`, {type: "Last pay"});
			console.log('Updated lastTx of getCryptoshackWorldPool', age)
		}
		else
			console.log('Could not load player count data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))
}

function getCryptoshackMaticPool() {

	// API for price data.
	axios.get(`https://api.polygonscan.com/api?module=account&action=balance&address=0x772b326d89fd0c74e7d42e402d2e4bf58d432440&apikey=ZSJ5QYP9EMWA89RG1F9PBPKUCR9UYV4YVR`).then(res => {
		// If we got a valid response
		//console.log(res.data)
		if(res.data && res.data.result) {
			//console.log(tokens);
			let amount = parseFloat(ethers.utils.formatEther(res.data.result)) || 0; // Default to zero
			// let priceChange = res.data[0].price_change_percentage_24h || 0 // Default to zero
			let symbol = 'MATIC' 

			client5.user.setActivity(
				`POOL`,
				{ type: "WATCHING" }
			)

			client5.guilds.cache.find(guild => guild.id === process.env.SERVER_ID).me.setNickname(`${(amount).toLocaleString().replace(/,/g,process.env.THOUSAND_SEPARATOR)}  ${symbol}`)
			console.log('Updated price to getCryptoshackMaticPool', amount)
		}
		else
			console.log('Could not load player count data for', process.env.BLOCK_ID)

	}).catch(err => console.log('Error at api data:', err))
}

async function getUserTime(wallet) {
	
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

// Runs when client connects to Discord.
client4.on('ready', () => {
	console.log('Logged in as', client4.user.tag)

	getCryptoshackWorldPool() // Ping server once on startup
	// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
	setInterval(getCryptoshackWorldPool, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

// Runs when client connects to Discord.
client5.on('ready', () => {
	console.log('Logged in as', client5.user.tag)

	getCryptoshackMaticPool() // Ping server once on startup
	// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
	setInterval(getCryptoshackMaticPool, Math.max(1, process.env.MC_PING_FREQUENCY || 4) * 1000)
})

client1.on('interactionCreate', async interaction => {
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
		/* axios.get(`https://server-dxhfx4osrq-ue.a.run.app/block/reward/${userWallet}`)
			.then( res => {
				if(res.data && res.data.playReward) {
					userBlocks = res.data.playReward || 0 // Default to zero;
					console.log(res.data);
					console.log(userBlocks);
				}
				else
					console.log('Could not load player data for', userWallet)
			})
			.catch((error) => {
				console.error('Error:', error);
			}); */
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


				//client1.channels.cache.get('971975505458909205').send({ embeds: [userReport] });				
				await interaction.editReply({ embeds: [userReport] })
			})
			.catch((error) => {
				console.error('Error:', error);
			});
		
		}
});

// Login to Discord
client1.login(process.env.DISCORD_TOKEN_1)
client2.login(process.env.DISCORD_TOKEN_2)
client3.login(process.env.DISCORD_TOKEN_3)
client4.login(process.env.DISCORD_TOKEN_4)
client5.login(process.env.DISCORD_TOKEN_5)