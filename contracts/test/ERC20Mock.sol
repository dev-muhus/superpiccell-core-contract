// SPDX-License-Identifier: UNLICENSED
pragma solidity >= 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    bool private shouldFail;
    
    constructor (string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function setTransferFail(bool fail) public {
        shouldFail = fail;
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        if (shouldFail) {
            return false;
        }
        return super.transfer(recipient, amount);
    }
}