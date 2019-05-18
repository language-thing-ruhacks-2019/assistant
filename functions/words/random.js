const wordTable = require('./words.json');

const getKey = (num) => {
    if (num === 1) return 'a1';
    if (num === 2) return 'a2';
    if (num === 3) return 'b1';
    if (num === 4) return 'b2';
    if (num === 5) return 'c1';
    if (num === 6) return 'c2';
    return 'a1';
}
const words = (index) => {
    const key = getKey(index);
    return wordTable[key][Math.floor(Math.random() * wordTable[key].length)]
}

module.exports = words;