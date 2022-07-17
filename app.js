require('dotenv').config();
const fs = require('fs');

const {Client, Intents, Collection} = require('discord.js');

const {drawCard, addToPlayer, updateMessage, addToHome} = require('./helpers/game');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles)
{
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.name, cmd);
}

client.on('ready', () =>
{
    console.log(client.user.tag);
});

client.on('messageCreate', (message) =>
{
    const prefix = '*';

    if(!message.content.startsWith(prefix)) return;

    const list = message.content.split(' ');
    const command = list[0].slice(prefix.length).toLocaleLowerCase();
    const args = list.splice(1);

    const excCmd = client.commands.get(command);
    if(!excCmd) return;

    excCmd.execute(client, message, args);
});

client.on('interactionCreate', async(interaction) =>
{
    if(interaction.isButton())
    {
        const idValues = interaction.customId.split('|');
        if(idValues[0] === 'H')
        {
            const {messageString, score} = await drawCard(interaction.message, idValues[1], 1);

            addToPlayer(score, messageString);
            updateMessage(interaction, undefined, idValues[1]);
        }
        else if(idValues[0] === 'S')
        {
            let flag;

            do 
            {
                const {messageString, score} = await drawCard(interaction.message, idValues[1], 1);
                flag = addToHome(score, messageString);
            } while(flag);

            updateMessage(interaction, undefined, idValues[1], true);
        }
    }
});

client.login(process.env.TOKEN);