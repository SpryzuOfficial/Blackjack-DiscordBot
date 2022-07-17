const fetch = require('node-fetch');
const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

const getEmoji = require('./getEmoji');
const { checkSuccess } = require('./requestErrors');

let player = 0;
let playerCards = '\n';

let home = 0;
let homeCards = '<:blankbacktop:714565166070759454>\n<:blankbackbot:714565093798576455>';

let messageId;

const drawCard = async(message, deck_id, count) =>
{
    return await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`, {method: 'Get'})
        .then(res => res.json())
        .then(cards_json =>
        {
            if(!checkSuccess(cards_json, message)) return;

            let score = 0;

            let cardsMessageTop = '';
            let cardsMessageBottom = '';

            cards_json.cards.forEach(e =>
            {
                const [card, suit] = getEmoji(e.code, e.suit);

                cardsMessageTop += card + ' ';
                cardsMessageBottom += suit + ' ';

                score += e.value.length > 1 ? 10 : Number.parseInt(e.value);
            });

            return {messageString: cardsMessageTop + '\n' + cardsMessageBottom, score};
        });
}

const addToPlayer = (score, cards) =>
{
    const playerCardsInLine = playerCards.split('\n');
    const cardsInLine = cards.split('\n');

    playerCards = `${playerCardsInLine[0] + cardsInLine[0]}\n${playerCardsInLine[1] + cardsInLine[1]}`;
    player += score;
}

const addToHome = (score, cards) =>
{
    const homeCardsInLine = homeCards.split('\n');
    const cardsInLine = cards.split('\n');

    homeCards = `${homeCardsInLine[0] + cardsInLine[0]}\n${homeCardsInLine[1] + cardsInLine[1]}`;
    
    home += score;

    return (home < player);
}

const updateMessage = async(interaction, message, deck_id, stand=false) =>
{
    let gameover = false;

    const embed = new MessageEmbed()
            .setTitle('Blackjack')
            .setColor('DARK_GREEN')
            .addField(`**Home**: ${home}`, homeCards, true)
            .addField(`**Player**: ${player}`, playerCards, true);
                
    const row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setStyle('SUCCESS')
                    .setLabel('Hit')
                    .setCustomId(`H|${deck_id}`),

                new MessageButton()
                    .setStyle('SUCCESS')
                    .setLabel('Stand')
                    .setCustomId(`S|${deck_id}`)
            ]);

    if(player > 21)
    {
        embed.setDescription('**Home wins**');
        row.components.forEach(e => e.setDisabled(true));

        gameover = true;
    }
    else if(player == 21)
    {
        embed.setDescription('**Player wins**');
        row.components.forEach(e => e.setDisabled(true));

        gameover = true;
    }
    else if(stand)
    {
        embed.setDescription(`**${home > 21 ? 'Player wins' : home < player ? 'Player wins' : home == player ? 'Tie' : 'Home wins'}**`);
        row.components.forEach(e => e.setDisabled(true));

        gameover = true;
    }

    if(!messageId)
    {
        message.channel.send({embeds: [embed], components: [row]})
                .then(msg =>
                {
                    messageId = msg.id;
                });
    }
    else
    {
        interaction.deferUpdate();

        interaction.message.channel.messages.fetch(messageId)
                        .then(msg =>
                        {
                            msg.edit({embeds: [embed], components: [row]})
                        });
    }

    if(gameover)
    {
        player = 0;
        playerCards = '\n';

        home = 0;
        homeCards = '<:blankbacktop:714565166070759454>\n<:blankbackbot:714565093798576455>';

        messageId = undefined;
    };
}

module.exports = {
    drawCard,
    addToPlayer,
    addToHome,
    updateMessage
};