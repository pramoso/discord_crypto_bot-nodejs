const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const cheerio = require('cheerio');
const wallets = require('../discord-wallets.json');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reward')
		.setDescription('Reporte de ingresos o gastos de blocks en el juego.'),
	async execute(interaction) {
		await interaction.deferReply();

        let marketplaceReport = {};
        let ingameReport = {};

        for (const [key, value] of Object.entries(wallets)) {
            console.log(`${key}: ${value}`);

            const blockResponse = await axios.get(`https://server-dxhfx4osrq-ue.a.run.app/block/reward/${value}`);           
            let userMarketplace = blockResponse.data.inGameMarketplaceReward || 0;
            let userIngame = blockResponse.data.offchainTransactionReward || 0;
            
            console.log(userMarketplace);
            console.log(userIngame);

            if (userMarketplace != 0) {
                marketplaceReport[key] = userMarketplace;
                console.log('marketplaceReport', userMarketplace);
            } 

            if (userIngame != 0) {
                ingameReport[key] = userIngame;
                console.log('ingameReport', userIngame);
            } 
        }

        marketplace = Object.entries(marketplaceReport).sort((a,b) => b[1]-a[1]);
        ingame = Object.entries(ingameReport).sort((a,b) => a[1]-b[1]);
        console.log(marketplace);
        console.log(ingame);

        let marketplaceReportSorted = {}
        let ingameReportSorted = {}
        
        marketplace.forEach(function(item){
            marketplaceReportSorted[item[0]] = item[1];
        })

        ingame.forEach(function(item){
            ingameReportSorted[item[0]] = item[1];
        })
		
        const userReport = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Listado de ingresos y gastos de blocks en el juego')
            //.setURL(`https://www.critterztracker.com/${userWallet}`)
            //.setAuthor({ name: 'proc', iconURL: 'https://i.imgur.com/HqdTrxJ.png', url: 'https://discord.js.org' })
            .setDescription(`<@${interaction.user.id}> este es el reporte al dia de hoy.`)
            .setThumbnail('https://i.imgur.com/ZccgsMC.jpeg')
            

        let i = 0;
        if (marketplace) {
            let list = ''
            for (const [key, value] of Object.entries(marketplaceReportSorted)) {
                i += 1;                
                list += `${i}. <@${key}> ${value}`;
                list += '\n';
            }
            userReport.addField('Marketplace (Ventas)', list, false);
        }       
        
        if (ingame) {
            let list = ''
            let i = 0;
            for (const [key, value] of Object.entries(ingameReportSorted)) {
                i += 1;
                list += `${i}. <@${key}> ${value}`;
                list += '\n';                
            }

            userReport.addField('Ingame (Gastos de teleport y otros)', list, false);
        }

        userReport.setTimestamp()
        userReport.setFooter({ text: 'Bot para Critterz', iconURL: 'https://i.imgur.com/ZccgsMC.jpeg' });
		
        await interaction.editReply({ embeds: [userReport] })
	},
};