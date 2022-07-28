const checkSuccess = (json, interaction) =>
{
    if(!json.success)
    {
        interaction.reply('Unexpected error! please contact with the Staff team');

        return false;
    }

    return true;
}

module.exports = {
    checkSuccess
};