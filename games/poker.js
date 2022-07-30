const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const {drawCard, shuffleNewDeck} = require('../helpers/cards');

const games = [];

const createGame = async(id, max) =>
{
    const {deck_id} = await shuffleNewDeck(1);

    const players = [{
        id,
        cards: [],
        cardsMsg: '\n',
    }];

    games.push({
        id,
        deck_id,
        max,
        players
    });
}

const joinPlayer = (id, playerId) =>
{
    const { result, index } = searchId(id);
    if(!result) return;

    const {result: searchResult} = searchPlayer(index, playerId);

    if(searchResult) return {res: false, msg: 'You joined already, if you want to quit use `/quitpoker`'};

    if(games.at(index).players.length === games.at(index).max) return {res: false, msg: 'You cant join, the game is full!'};

    games.at(index).players.push({
        id: playerId,
        cards: []
    });

    return {res: true};
}

const kickPlayer = (id, playerId) =>
{
    const { result, index } = searchId(id);
    if(!result) return;

    if(id === playerId)
    {
        games.splice(index, 1);
        return true;
    }

    const {result: searchResult} = searchPlayer(index, playerId);

    let flag = false;

    if(searchResult)
    {
        games.at(index).players.forEach((e, i) =>
        {
            if(e.id === playerId)
            {
                games.at(index).players.splice(i, 1);

                flag = true;
                return;
            }
        });
    }

    return flag;
}

const giveCardsPlayers = (id, interaction) =>
{
    const { result, index } = searchId(id);
    if(!result) return;

    games.at(index).players.forEach(async(e, i) =>
    {
        const {messageString: cardsMsg, codes: cards} = await drawCard(interaction, games.at(index).deck_id, 4);
    
        games.at(index).players.at(i).cardsMsg = cardsMsg;
        games.at(index).players.at(i).cards = cards;

        interaction.client.users.fetch(e.id)
            .then(res => 
            {
                res.send(cardsMsg)
            });
    });
}

const updateMessage = (interaction, id) =>
{
    const { result, index } = searchId(id);
    if(!result)
    { 
        const embed = new MessageEmbed()
            .setTitle('Poker')
            .setDescription(`Poker game deleted by <@!${id}>`)
            .setColor('DARK_GREEN');

        interaction.reply({embeds: [embed]});
        return;
    }

    const nPlayers = games.at(index).players.length;
    const maxPlayers = games.at(index).max;

    let players = '';
    games.at(index).players.forEach(e =>
    {
        players += `<@!${e.id}> `;
    });

    const embed = new MessageEmbed()
            .setTitle('Poker')
            .setDescription(`<@!${id}> has started a poker game!\nJoin now!`)
            .setColor('DARK_GREEN')
            .addField(`**Players ${nPlayers}/${maxPlayers}**`, players);

    const row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setLabel('Join')
                    .setStyle('SUCCESS')
                    .setCustomId(`PJP|${id}`),
                new MessageButton()
                    .setLabel('Quit')
                    .setStyle('DANGER')
                    .setCustomId(`PQG|${id}`),
                new MessageButton()
                    .setLabel('Start game')
                    .setStyle('SECONDARY')
                    .setDisabled((nPlayers !== maxPlayers))
                    .setCustomId(`PSG|${id}`)
            ]);

    interaction.reply({embeds: [embed], components: [row]});
    if(interaction.message) interaction.message.delete();
}

const pokerInteractions = (interaction) =>
{
    const id = interaction.member.id;

    if(interaction.isButton())
    {
        const idValues = interaction.customId.split('|');

        if(idValues[0] === 'PJP')
        {
            const joinRes = joinPlayer(idValues[1], id);

            if(joinRes.res) return updateMessage(interaction, idValues[1]);

            interaction.reply({content: joinRes.msg, ephemeral: true});
        }

        if(idValues[0] === 'PSG')
        {
            giveCardsPlayers(idValues[1], interaction);
        }

        if(idValues[0] === 'PQG')
        {
            if(kickPlayer(idValues[1], id)) return updateMessage(interaction, idValues[1]);

            interaction.reply({content: `You are not in this game!`, ephemeral: true});
        }
    }
}

const searchPlayer = (index, playerId) =>
{
    let result = false;
    let playerIndex;

    games.at(index).players.forEach((e, i) =>
    {
        if(e.id === playerId)
        {
            result = true;
            playerIndex = i;
            return;
        }
    });

    return {result, index: playerIndex};
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
    pokerInteractions,
    createGame,
    updateMessage
}