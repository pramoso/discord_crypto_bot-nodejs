require('dotenv').config() // Load .env file
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
	new SlashCommandBuilder().setName('time').setDescription('Muestra tus últimos tiempos registrados.'),
	new SlashCommandBuilder().setName('today').setDescription('Muestra los tiempos registrados de hoy.'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN_1);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.SERVER_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);