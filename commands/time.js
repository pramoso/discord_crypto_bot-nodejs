const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const cheerio = require('cheerio');
const wallets = require('../discord-wallets.json');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Muestra tus últimos tiempos registrados.'),
	async execute(interaction) {
		await interaction.deferReply();

        const userWallet = wallets[interaction.user.tag];
		const res = await axios.get(`https://server-dxhfx4osrq-ue.a.run.app/block/reward/${userWallet}`);
		var userBlocks = res.data.playReward || 0;

		
		axios.get(`https://www.critterztracker.com/${userWallet}`)
			.then(async response => {
				const $ = cheerio.load(response.data);
				const userInfo = $('script:not([src])')[0].children[0].data
				const time = JSON.parse(userInfo.match(/timePerEpoch":(\[.*?\])/)[1]);
				const staked = JSON.parse(userInfo.match(/,"staked":(\[.*?\])/)[1]);

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
	},
};