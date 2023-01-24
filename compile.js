const path = require('path');
const fs = require('fs');
const solc = require('sold');

const lotteryPath = path.resolve(__dirname, 'contracts', 'lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf-8');

const input = {
    language: 'Solidity',
    sources: {
        'lottery.sol': {
            content: source
        }
    },

    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}

function findImports (path) {
    return { contents: source };
}
module.exports = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports })).contracts['lottery.sol']['Lottery'];