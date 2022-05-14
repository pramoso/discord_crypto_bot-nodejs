const axios = require('axios');
const wallets = require('../../discord-wallets.json');
const login = require('../../database/login');
const logout = require('../../database/logout');
const listing = require('../../database/listing');

const schedule = require('node-schedule');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');

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

async function checkLogin(client) {
	for (const [key, value] of Object.entries(wallets)) {

		const operationsDoc = `
			query MyQuery {
				player_log(
				where: {account_address: {_eq: "${value}"}}
				order_by: {login_timestamp: desc}
				limit: 1
				) {
				id
				login_timestamp
				logout_timestamp
				}
			}
			`;
		
		const body = JSON.stringify({
			query: operationsDoc,
			variables: {},
			operationName: "MyQuery"
			});

		try {
			const result = await axios.post(`https://hasura-dxhfx4osrq-ue.a.run.app/v1/graphql`, body);

			const [lastLogin] = result.data.data.player_log;
			let dateLogin = new Date(lastLogin.login_timestamp);
			let dateLogout = new Date(lastLogin.logout_timestamp);
			let dateLogoutRange = new Date(dateLogout.getTime() + 1.5*60000);		
			let now = new Date();

			if (!login[value]) {
				login[value] = lastLogin.id;			
				console.log(`${key} Último registro el ${dateLogin.toLocaleString('es-MX')}.`);
			} else if (login[value] != lastLogin.id ) {
				login[value] = lastLogin.id;
				let timestamp = Math.floor(dateLogin.getTime() / 1000);
				console.log(`${key} ha empezado a acumular minutos a las ${dateLogin.toLocaleString()}.`);
				client.channels.cache.get(process.env.BLK_LOG_DISCORD_CHANNEL).send(`<@${key}> ha empezado a acumular minutos a las <t:${timestamp}> :green_circle:`);
			} 
			
			if (!logout[value] && dateLogoutRange < now) {
				logout[value] = lastLogin.id;
				console.log(`${key} Último afk el ${dateLogout.toLocaleString('es-MX')}.`);
			} else if (logout[value] != lastLogin.id && dateLogoutRange < now) {
				logout[value] = lastLogin.id;
				let timestamp = Math.floor(dateLogout.getTime() / 1000);
				console.log(`${key} ha dejado de acumular minutos a las ${dateLogout.toLocaleString()}.`);
				client.channels.cache.get(process.env.BLK_LOG_DISCORD_CHANNEL).send(`<@${key}> ha dejado de acumular minutos a las <t:${timestamp}> :red_circle:`);
			} 
		  } catch (err) {
			console.log('Error at checkLogin:', err)
			//throw new Error('Unable to checkLogin.', err)
		  }		
	}
}

async function checkListing(client) {
	for (const [key, value] of Object.entries(wallets)) {

		const operationsDoc = `
			query MyQuery {
				in_game_item_listing(
				where: {account_address: {_eq: "${value}"}}
				order_by: {timestamp: desc}
				limit: 1
				) {
				item_name
				item_quantity
				item_quantity_left
				price
				id
				listing_name
				active
				timestamp
				}
			}
			`;

		
		const body = JSON.stringify({
			query: operationsDoc,
			variables: {},
			operationName: "MyQuery"
			});	

		try {
			const result = await axios.post(`https://hasura-dxhfx4osrq-ue.a.run.app/v1/graphql`, body);

			if (result.data && result.data.data.in_game_item_listing.length) {
				const [lastListing] = result.data.data.in_game_item_listing;
				const d = new Date(lastListing.timestamp);
				const ts = Math.floor(d.getTime() / 1000);
	
				if (!listing[value]) {
					listing[value] = lastListing.id;			
					console.log(`${key} Último listado registrado ${lastListing.item_quantity}x${lastListing.item_name} el ${d.toLocaleString('es-MX')}`);
					// client.channels.cache.get(process.env.BLK_LOG_DISCORD_CHANNEL).send(`<@${key}> último listado registrado ${lastListing.item_quantity}x${lastListing.item_name} el <t:${ts}> :shopping_cart:`);
				} else if (listing[value] != lastListing.id ) {
					listing[value] = lastListing.id;
					console.log(`${key} Se ha listado ${lastListing.item_quantity}x${lastListing.item_name} el ${d.toLocaleString('es-MX')}`);
					client.channels.cache.get(process.env.BLK_LOG_DISCORD_CHANNEL).send(`<@${key}> ha listado ${lastListing.item_quantity}x${lastListing.item_name} el <t:${ts}> :shopping_cart:`);
				} 
			}
		  } catch (err) {
			console.log('Error at checkListing:', err)
			//throw new Error('Unable to checkListing.', err)
		  }		
	}
}

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        getValue(client) // Update status once on startup
		checkLogin(client);
		checkListing(client);
		
        // Set the new status message every x seconds
        setInterval(getValue, Math.max(1, process.env.UPDATE_SHORT_FREQUENCY || 4) * 1000, client);
        setInterval(checkLogin, Math.max(1, process.env.UPDATE_SHORT_FREQUENCY || 4) * 1000, client);
        setInterval(checkListing, Math.max(1, process.env.UPDATE_SHORT_FREQUENCY || 4) * 1000, client);

		const rule1 = new schedule.RecurrenceRule();
		
		rule1.hour = 23;
		rule1.minute = 55;
		rule1.tz = 'Etc/UTC';

		const jobNewDayAlert = schedule.scheduleJob(rule1, function() {
			client.channels.cache.get(process.env.BLK_GRNL_DISCORD_CHANNEL).send(`<@&${process.env.CRITTERZ_ROLE}> está por reiniciar el dia. No se olviden de SALIRSE del servidor antes del reset. :rotating_light:`);
		})

		const rule2 = new schedule.RecurrenceRule();

		rule2.hour = 0;
		rule2.minute = 5;
		rule2.tz = 'Etc/UTC';

		const job = schedule.scheduleJob(rule2, async function(){
			console.log('Un nuevo día ha empezado y estos fueron los tiempos registrados ayer.');
			var aboveGoalTime = {};
			var belowGoalTime = {};

			for (const [key, value] of Object.entries(wallets)) {			

				try {
					let response = await axios.get(`https://www.critterztracker.com/${value}`);

					const $ = cheerio.load(response.data);
					const userInfo = $('script:not([src])')[0].children[0].data
					const userTime = JSON.parse(userInfo.match(/timePerEpoch":(\[.*?\])/)[1]);

					if ( userTime[1] >= 480) {
						aboveGoalTime[key] = userTime[1];
					} else {
						belowGoalTime[key] = userTime[1];
					}					

				} catch (err) {
					console.error('Error getting critterztracker.com data', err);
				}	
				
			}

			aboveTimes = Object.entries(aboveGoalTime).sort((a,b) => b[1]-a[1]);
			belowTimes = Object.entries(belowGoalTime).sort((a,b) => b[1]-a[1]);

			let aboveTimeSorted = {}
			let belowTimeSorted = {}
			
			aboveTimes.forEach(function(item){
				aboveTimeSorted[item[0]] = item[1];
			});

			belowTimes.forEach(function(item){
				belowTimeSorted[item[0]] = item[1];
			});

			var userReport = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Registro de tiempos consolidado')
					//.setURL(`https://www.critterztracker.com/${userWallet}`)
					//.setAuthor({ name: 'proc', iconURL: 'https://i.imgur.com/HqdTrxJ.png', url: 'https://discord.js.org' })
					.setDescription(`<@&${process.env.ADMIN_ROLE}> un nuevo día ha empezado y estos fueron los tiempos registrados ayer.`)
					.setThumbnail('https://i.imgur.com/ZccgsMC.jpeg')				
			
			if (Object.keys(aboveTimeSorted).length) {
				let i = 0;
				let list = ''
				for (const [key, value] of Object.entries(aboveTimeSorted)) {
					i += 1;                
					list += `${i}. <@${key}> ${value}`;
					list += '\n';
				}
				console.log(list);
				userReport.addField('SI cumplieron la meta :green_circle:', list, false);
			}

			if (Object.keys(belowTimeSorted).length) {
				let i = 0;
				let list = ''
				for (const [key, value] of Object.entries(belowTimeSorted)) {
					i += 1;                
					list += `${i}. <@${key}> ${value}`;
					list += '\n';
				}
				console.log(list);
				userReport.addField('NO cumplieron la meta :red_circle:', list, false);
			}   
				
			userReport.setTimestamp()
			userReport.setFooter({ text: 'Bot para Critterz', iconURL: 'https://i.imgur.com/ZccgsMC.jpeg' });

			//clientBlock.channels.cache.get('971975505458909205').send({ embeds: [userReport] });			
			client.channels.cache.get(process.env.BLK_GRNL_DISCORD_CHANNEL).send({ embeds: [userReport] })
		});

	},
};