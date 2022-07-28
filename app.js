require('dotenv').config();
const fs = require('fs');

const {Client, Intents, Collection} = require('discord.js');

const createSlash = require('./slashcommands');
const {blackjackInteractions} = require('./games/blackjack');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles)
{
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.name, cmd);
}

createSlash();
client.on('ready', () =>
{
    console.log(client.user.tag);
});

client.on('interactionCreate', async(interaction) =>
{
    if(interaction.isCommand())
    {
        const excCmd = client.commands.get(interaction.commandName);
        if(!excCmd) return;

        excCmd.execute(client, interaction);
    }

    blackjackInteractions(interaction);
});

client.login(process.env.TOKEN);