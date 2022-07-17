const checkSuccess = (json, message) =>
{
    if(!json.success)
    {
        message.channel.send('Unexpected error! please contact with the Staff team');

        return false;
    }

    return true;
}

module.exports = {
    checkSuccess
};