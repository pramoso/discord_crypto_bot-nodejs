require('dotenv').config() // Load .env file
const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');

const clientBlock = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientWrld = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientGas = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientWrldPool = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientMaticPool = new Client({ intents: [Intents.FLAGS.GUILDS] });
const clientWoW = new Client({ intents: [Intents.FLAGS.GUILDS] });

// clientBlock.commands = new Collection();
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
// 	const command = require(`./commands/${file}`);
// 	// Set a new item in the Collection
// 	// With the key as the command name and the value as the exported module
// 	clientBlock.commands.set(command.data.name, command);
// }

// const eventFilesBlock = fs.readdirSync('./events/block').filter(file => file.endsWith('.js'));

// for (const file of eventFilesBlock) {
// 	const event = require(`./events/block/${file}`);
// 	if (event.once) {
// 		clientBlock.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		clientBlock.on(event.name, (...args) => event.execute(...args));
// 	}
// }

// const eventFilesWrld = fs.readdirSync('./events/wrld').filter(file => file.endsWith('.js'));

// for (const file of eventFilesWrld) {
// 	const event = require(`./events/wrld/${file}`);
// 	if (event.once) {
// 		clientWrld.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		clientWrld.on(event.name, (...args) => event.execute(...args));
// 	}
// }

// const eventFilesGas = fs.readdirSync('./events/gas').filter(file => file.endsWith('.js'));

// for (const file of eventFilesGas) {
// 	const event = require(`./events/gas/${file}`);
// 	if (event.once) {
// 		clientGas.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		clientGas.on(event.name, (...args) => event.execute(...args));
// 	}
// }

// const eventFilesWrldPool = fs.readdirSync('./events/cs-wrld').filter(file => file.endsWith('.js'));

// for (const file of eventFilesWrldPool) {
// 	const event = require(`./events/cs-wrld/${file}`);
// 	if (event.once) {
// 		clientWrldPool.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		clientWrldPool.on(event.name, (...args) => event.execute(...args));
// 	}
// }

// const eventFilesMaticPool = fs.readdirSync('./events/cs-matic').filter(file => file.endsWith('.js'));

// for (const file of eventFilesMaticPool) {
// 	const event = require(`./events/cs-matic/${file}`);
// 	if (event.once) {
// 		clientMaticPool.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		clientMaticPool.on(event.name, (...args) => event.execute(...args));
// 	}
// }

const eventFilesWoW = fs.readdirSync('./events/wow').filter(file => file.endsWith('.js'));

for (const file of eventFilesWoW) {
	const event = require(`./events/wow/${file}`);
	if (event.once) {
		clientWoW.once(event.name, (...args) => event.execute(...args));
	} else {
		clientWoW.on(event.name, (...args) => event.execute(...args));
	}
}


// Login to Discord
// clientBlock.login(process.env.DISCORD_TOKEN_1)
// clientWrld.login(process.env.DISCORD_TOKEN_2)
// clientGas.login(process.env.DISCORD_TOKEN_3)
// clientWrldPool.login(process.env.DISCORD_TOKEN_4)
// clientMaticPool.login(process.env.DISCORD_TOKEN_5)
clientWoW.login(process.env.DISCORD_TOKEN_6)