const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const games = [];

const createGame = (id, max) =>
{
    const players = [{
        id,
        cards: []
    }];

    games.push({
        id,
        max,
        players
    });
}

const joinPlayer = (id, playerId) =>
{
    const result = searchId(id);

    if(searchPlayer(result.index, playerId)) return {res: false, msg: 'You joined already, if you want to quit use `/quitpoker`'};

    if(games.at(result.index).players.length === games.at(result.index).max) return {res: false, msg: 'You cant join, the game is full!'};

    games.at(result.index).players.push({
        id: playerId,
        cards: []
    });

    return {res: true};
}

const kickPlayer = (id, playerId) =>
{
    const result = searchId(id);

    let flag = false;

    if(searchPlayer(result.index, playerId))
    {
        games.at(result.index).players.forEach((e, i) =>
        {
            if(e.id === playerId)
            {
                games.at(result.index).players.splice(i, 1);

                flag = true;
                return;
            }
        });
    }

    return flag;
}

const updateMessage = (interaction, id) =>
{
    const result = searchId(id);

    const nPlayers = games.at(result.index).players.length;
    const maxPlayers = games.at(result.index).max;

    let players = '';
    games.at(result.index).players.forEach(e =>
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

    games.at(index).players.forEach(e =>
    {
        if(e.id === playerId)
        {
            result = true;
            return;
        }
    });

    return result;
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