const fetch = require('node-fetch');
const { checkSuccess } = require('./requestErrors');

const colors = [
    {
        name: 'H',
        color: 'r'
    },
    {
        name: 'D',
        color: 'r'
    },
    {
        name: 'C',
        color: 'b'
    },
    {
        name: 'S',
        color: 'b'
    },
];

const ids = [
    {
        name: 'bA',
        id: '623575870375985162'
    },
    {
        name: 'b2',
        id: '623564440574623774'
    },
    {
        name: 'b3',
        id: '623564440545263626'
    },
    {
        name: 'b4',
        id: '623564440624824320'
    },
    {
        name: 'b5',
        id: '623564440851316760'
    },
    {
        name: 'b6',
        id: '623564440679350319'
    },
    {
        name: 'b7',
        id: '623564440754978843'
    },
    {
        name: 'b8',
        id: '623564440826150912'
    },
    {
        name: 'b9',
        id: '623564440868225025'
    },
    {
        name: 'b10',
        id: '623564440620630057'
    },
    {
        name: 'bJ',
        id: '623564440951980084'
    },
    {
        name: 'bQ',
        id: '623564440851185679'
    },
    {
        name: 'bK',
        id: '623564440880807956'
    },
    {
        name: 'rA',
        id: '623575868672835584'
    },
    {
        name: 'r2',
        id: '623564440989859851'
    },
    {
        name: 'r3',
        id: '623564440880545798'
    },
    {
        name: 'r4',
        id: '623564441103106058'
    },
    {
        name: 'r5',
        id: '623564440868225035'
    },
    {
        name: 'r6',
        id: '623564440759173121'
    },
    {
        name: 'r7',
        id: '623564440964694036'
    },
    {
        name: 'r8',
        id: '623564440901779496'
    },
    {
        name: 'r9',
        id: '623564440897454081'
    },
    {
        name: 'r10',
        id: '623564440863899663'
    },
    {
        name: 'rJ',
        id: '623564440582881282'
    },
    {
        name: 'rQ',
        id: '623564440880807936'
    },
    {
        name: 'rK',
        id: '623564441073614848'
    },
    {
        name: 'eclubs',
        id: '623564441224740866'
    },
    {
        name: 'espades',
        id: '623564441094586378'
    },
    {
        name: 'ehearts',
        id: '623564441065226267'
    },
    {
        name: 'ediamonds',
        id: '623564440926683148'
    },
]

const getEmoji = (code = '', suit = '') => 
{
    const color = colors.find(e => e.name === code.charAt(1)).color;
    const name = color + (code.charAt(0) === '0' ? '10' : code.charAt(0));
    const id = ids.find(e => e.name === name).id;
    const emoji = `<:${name}:${id}>`;

    suit = `e${suit.toLocaleLowerCase()}`;
    const suitId = ids.find(e => e.name === suit).id;
    const suitEmoji = `<:${suit}:${suitId}>`;

    return [emoji, suitEmoji];
}

const drawCard = async(interaction, deck_id, count) =>
{
    return await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`, {method: 'Get'})
        .then(res => res.json())
        .then(cards_json =>
        {
            if(!checkSuccess(cards_json, interaction)) return;

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

module.exports = {
    getEmoji,
    drawCard
};