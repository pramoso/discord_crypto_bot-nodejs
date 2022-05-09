const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const cheerio = require('cheerio');
const wallets = require('../discord-wallets.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Reporte de tiempo consolidado de los últimos días'),
    async execute(interaction) {
        await interaction.deferReply();
        let timeReport = {};
        let blockReport = {};

        for (const [key, value] of Object.entries(wallets)) {
            console.log(`${key}: ${value}`);

            const blockResponse = await axios.get(`https://server-dxhfx4osrq-ue.a.run.app/block/reward/${value}`);
            let userBlock = blockResponse.data.playReward || 0;

            const timeResponse = await axios.get(`https://www.critterztracker.com/${value}`);
            const $ = cheerio.load(timeResponse.data);
            const userInfo = $('script:not([src])')[0].children[0].data;
            let userTime = JSON.parse(userInfo.match(/timePerEpoch":(\[.*?\])/)[1]);

            timeReport[key] = userTime.reverse();
            blockReport[key] = userBlock;

        }

        console.log(timeReport);
        console.log(blockReport);
        await interaction.editReply('Done!', { ephemeral: true })
    }
}