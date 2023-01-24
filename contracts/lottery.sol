// SPDX-License-Identifier: chirayu

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address private manager;
    address[] private players;

    constructor() {
        manager = msg.sender;
    }

    function getManager() public view returns(address) {
        return manager;
    }

    function getPlayers() public view returns(address[] memory) {
        return players;
    }

    function enter() public payable {
        require(msg.value >= 0.01 ether, "The least amount to enter in the lottery is 0.01 ether");
        players.push(msg.sender);
    }

    function getRandomNumber() private view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }


    function pickWinner() public payable {
        require(players.length > 0, "No player has entered");
        require(msg.sender == manager, "You are not authorized to pick a winner");
        uint winnerIndex = getRandomNumber() % players.length;
        payable(players[winnerIndex]).transfer(address(this).balance);
        resetContract();
    }

    function resetContract() private {
        delete players;
    }
}