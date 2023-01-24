const ganache = require('ganache');
const Web3 = require('web3');
const compiled_contract = require('../compile.js');
const assert = require('assert');

const abi = compiled_contract.abi;
const bytecode = compiled_contract.evm.bytecode.object;

const web3 = new Web3(ganache.provider());

let accounts;
let lotteryContract;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lotteryContract = await new web3.eth.Contract(abi)
                        .deploy({data: bytecode})
                        .send({from: accounts[0], gas: 1000000});
})

describe("Testing Lottery Contract", () => {
    it("Deploys a Contract", () => {
        assert.ok(lotteryContract.options.address);
    });

    it("does nor allow owner to enter", async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.01', 'ether'),
                gas: 1000000
            });
        } catch(err) {
            assert(err);
        }
    });

    it("does nor allow player to enter with value less than 0.01 ether", async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei('0.001', 'ether'),
                gas: 1000000
            });
        } catch(err) {
            assert(err);
        }
    });

    it("allows player to enter with value >= 0.01 ether", async () => {
        await lotteryContract.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.01', 'ether'),
            gas: 1000000
        });
        const players = await lotteryContract.methods.getPlayers().call();
        assert.equal(players.length, 1);
        assert.equal(players[0], accounts[1]);
    });

    it("allows multiple players to enter with value >= 0.01 ether", async () => {
        await lotteryContract.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.01', 'ether'),
            gas: 1000000
        });
        await lotteryContract.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.01', 'ether'),
            gas: 1000000
        });
        await lotteryContract.methods.enter().send({
            from: accounts[3],
            value: web3.utils.toWei('0.01', 'ether'),
            gas: 1000000
        });
        const players = await lotteryContract.methods.getPlayers().call();
        assert.equal(players.length, 3);
        assert.equal(players[0], accounts[1]);
        assert.equal(players[1], accounts[2]);
        assert.equal(players[2], accounts[3]);
    });

    it("does not allow anyone to pick winner except manager", async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei('0.01', 'ether'),
                gas: 1000000
            });
            await lotteryContract.methods.enter().send({
                from: accounts[2],
                value: web3.utils.toWei('0.01', 'ether'),
                gas: 1000000
            });
            await lotteryContract.methods.pickWinner().send({
                from: accounts[2],
                gas: 100000
            });
        } catch(err) {
            assert(err);
        }
    });

    it("does not allow manager to pick winner if no one has entered", async () => {
        try {
            await lotteryContract.methods.pickWinner().send({
                from: accounts[2],
                gas: 100000
            });
        } catch(err) {
            assert(err);
        }
    });

    it("contract is reset after picking winner", async () => {
        await lotteryContract.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.01', 'ether'),
            gas: 1000000
        });
        await lotteryContract.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.01', 'ether'),
            gas: 1000000
        });
        await lotteryContract.methods.pickWinner().send({
            from: accounts[0],
            gas: 100000
        });

        const players = await lotteryContract.methods.getPlayers().call();
        assert.equal(players.length, 0);
        assert.equal(await web3.eth.getBalance(lotteryContract.address), 0);
    });
})