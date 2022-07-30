const { SlashCommandBuilder } = require('@discordjs/builders');

const { addToPlayer, 
        addToHome, 
        updateMessage,
        createGame } = require('../games/blackjack');

const { drawCard, shuffleNewDeck } = require('../helpers/cards');

module.exports = {
    name: 'blackjack',

    data: new SlashCommandBuilder()
            .setName('blackjack')
            .setDescription('Starts a blackjack game')
            .addNumberOption((option) => option.setName('deck-count').setDescription('Number of decks').setRequired(true).setMinValue(1)),

    async execute(client, interaction)
    {
        const deckCount = interaction.options.getNumber('deck-count');

        const {deck_id} = await shuffleNewDeck(deckCount);
        if(!deck_id) return;

        const id = interaction.member.id;
        if(!createGame(id))
        {
            interaction.reply({content: 'You are playing Blackjack!', ephemeral: true});
            return;
        }

        const {messageString: playerCardsString, score: playerScore} = await drawCard(interaction, deck_id, 2);
        const {messageString: homeCardsString, score: homeScore} = await drawCard(interaction, deck_id, 1);

        addToPlayer(id, playerScore, playerCardsString);
        addToHome(id, homeScore, homeCardsString);

        updateMessage(id, interaction, deck_id);
    }
}