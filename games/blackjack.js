const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

const { drawCard } = require('../helpers/cards');

let games = [];

const createGame = (id) =>
{
    if(searchId(id).result) return false;

    games.push({
        id,
        player: {
            points: 0,
            cards: '\n'
        },
        home: {
            points: 0,
            cards: '<:blankbacktop:714565166070759454>\n<:blankbackbot:714565093798576455>'
        }
    });

    return true;
}

const endGame = (id) =>
{
    const res = searchId(id);

    if(res.result) games.splice(games.indexOf(res.index), 1);
}

const addToPlayer = (id, score, cards) =>
{   
    const res = searchId(id);

    if(!res.result) return;

    const playerCardsInLine = res.element.player.cards.split('\n');
    const cardsInLine = cards.split('\n');

    games.at(res.index).player.cards = `${playerCardsInLine[0] + cardsInLine[0]}\n${playerCardsInLine[1] + cardsInLine[1]}`;
    games.at(res.index).player.points += score;
}

const addToHome = (id, score, cards) =>
{
    const res = searchId(id);

    if(!res.result) return;

    const homeCardsInLine = res.element.home.cards.split('\n');
    const cardsInLine = cards.split('\n');

    games.at(res.index).home.cards = `${homeCardsInLine[0] + cardsInLine[0]}\n${homeCardsInLine[1] + cardsInLine[1]}`;
    games.at(res.index).home.points += score;

    return (games.at(res.index).home.points < games.at(res.index).player.points);
}

const updateMessage = async(id, interaction, deck_id, stand=false) =>
{
    const res = searchId(id);

    if(!res.result) return;

    let gameover = false;

    const home = games.at(res.index).home.points;
    const player = games.at(res.index).player.points;

    const homeCards = games.at(res.index).home.cards;
    const playerCards = games.at(res.index).player.cards;

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

    interaction.reply({embeds: [embed], components: [row]});
    if(interaction.message) interaction.message.delete();

    if(gameover) endGame(id);
}

const blackjackInteractions = async(interaction) =>
{
    const id = interaction.member.id;
    if(interaction.isButton())
    {
        const idValues = interaction.customId.split('|');
        if(idValues[0] === 'H')
        {
            const {messageString, score} = await drawCard(interaction, idValues[1], 1);

            addToPlayer(id, score, messageString);
            updateMessage(id, interaction, idValues[1]);
        }
        else if(idValues[0] === 'S')
        {
            let flag;

            do 
            {
                const {messageString, score} = await drawCard(interaction, idValues[1], 1);
                flag = addToHome(id, score, messageString);
            } while(flag);

            updateMessage(id, interaction, idValues[1], true);
        }
    }
}

const searchId = (id) =>
{
    let result = false;
    let index = -1;
    let element = undefined;

    games.forEach((e, i) =>
    {
        if(e.id === id)
        {
            result = true;
            index = i;
            element = e;
            return;
        }
    });

    return {
        result,
        index,
        element
    }
}

module.exports = {
    blackjackInteractions,
    addToPlayer, 
    addToHome, 
    updateMessage,
    createGame
};