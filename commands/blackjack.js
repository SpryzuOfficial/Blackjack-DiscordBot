const fetch = require('node-fetch');

const { SlashCommandBuilder } = require('@discordjs/builders');

const { addToPlayer, 
        addToHome, 
        updateMessage,
        createGame } = require('../games/blackjack');

const { drawCard } = require('../helpers/cards');
const { checkSuccess } = require('../helpers/requestErrors');

module.exports = {
    name: 'blackjack',

    data: new SlashCommandBuilder()
            .setName('blackjack')
            .setDescription('Starts a blackjack game')
            .addNumberOption((option) => option.setName('deck-count').setDescription('Number of decks').setRequired(true).setMinValue(1)),

    async execute(client, interaction)
    {
        const settings = {method: 'Get'};
        
        const deckCount = interaction.options.getNumber('deck-count');

        fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deckCount}`, settings)
            .then(res => res.json())
            .then(async(deck_json) =>
            {
                if(!checkSuccess(deck_json, interaction)) return;

                const id = interaction.member.id;
                if(!createGame(id))
                {
                    interaction.reply({content: 'You are playing Blackjack!', ephemeral: true});
                    return;
                }

                const deck_id = deck_json.deck_id;

                const {messageString: playerCardsString, score: playerScore} = await drawCard(interaction, deck_id, 2);
                const {messageString: homeCardsString, score: homeScore} = await drawCard(interaction, deck_id, 1);

                addToPlayer(id, playerScore, playerCardsString);
                addToHome(id, homeScore, homeCardsString);

                updateMessage(id, interaction, deck_id);
            });
    }
}