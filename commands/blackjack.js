const fetch = require('node-fetch');

const { drawCard, 
        addToPlayer, 
        addToHome, 
        updateMessage } = require('../helpers/game');

const { checkSuccess } = require('../helpers/requestErrors');

module.exports = {
    name: 'blackjack',

    async execute(client, message, args)
    {
        const settings = {method: 'Get'};

        fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${(args.length > 0) ? args[0] : 1}`, settings)
            .then(res => res.json())
            .then(async(deck_json) =>
            {
                if(!checkSuccess(deck_json, message)) return;

                const deck_id = deck_json.deck_id;

                const {messageString: playerCardsString, score: playerScore} = await drawCard(message, deck_id, 2);
                const {messageString: homeCardsString, score: homeScore} = await drawCard(message, deck_id, 1);

                addToPlayer(playerScore, playerCardsString);
                addToHome(homeScore, homeCardsString);

                updateMessage(undefined, message, deck_id);
            });
    }
}