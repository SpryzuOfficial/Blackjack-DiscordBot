const { SlashCommandBuilder } = require('@discordjs/builders');

const { createGame, updateMessage } = require('../games/poker');

module.exports = {
    name: 'poker',

    data: new SlashCommandBuilder()
            .setName('poker')
            .setDescription('Starts a poker game')
            .addNumberOption((option) => option.setName('num-players').setDescription('Number of players').setRequired(true).setMinValue(2).setMaxValue(4)),

    async execute(client, interaction)
    {
        const id = interaction.member.id;
        const maxPlayers = interaction.options.getNumber('num-players');
        
        await createGame(id, maxPlayers);

        updateMessage(interaction, id);
    }
}