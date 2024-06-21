// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SuperPiccellCore is Ownable {
    // State variables
    struct Content {
        uint256 id;
        bool exists;
        string encoding;
        string contentType;
        string content;
        string revision;
        uint256 createdAt;
        address createdBy;
        uint256 updatedAt;
        address updatedBy;
    }

    mapping(uint256 => Content) public contents;
    uint256 public nextContentId = 1;
    bool public isProtected = false;

    // Events
    event ContentCreated(uint256 id, string content);
    event ContentUpdated(uint256 id, string newContent);
    event ContentDeleted(uint256 id);

    // Function to create a new content
    function createContent(string memory _encoding, string memory _contentType, string memory _content, string memory _revision) public onlyOwner {
        require(!isProtected, "Contract is protected");
        Content memory newContent = Content({
            id: nextContentId,
            exists: true,
            encoding: _encoding,
            contentType: _contentType,
            content: _content,
            revision: _revision,
            createdAt: block.timestamp,
            createdBy: msg.sender,
            updatedAt: block.timestamp,
            updatedBy: msg.sender
        });
        contents[nextContentId] = newContent;
        emit ContentCreated(nextContentId, _content);
        nextContentId++;
    }

    // Function to update the content
    function updateContent(uint256 id, string memory _content) public onlyOwner {
        require(!isProtected, "Contract is protected");
        Content storage content = contents[id];
        require(content.exists, "Content does not exist");
        content.content = _content;
        content.updatedAt = block.timestamp;
        content.updatedBy = msg.sender;
        emit ContentUpdated(id, _content);
    }

    // Function to delete the content
    function deleteContent(uint256 id) public onlyOwner {
        require(!isProtected, "Contract is protected");
        require(contents[id].exists, "Content does not exist");
        contents[id].exists = false;
        emit ContentDeleted(id);
    }

    // Function to get the content
    function getContent(uint256 id) public view returns (Content memory) {
        require(contents[id].exists, "Content does not exist");
        return contents[id];
    }

    // Function to get all contents
    function getAllContents() public view returns (Content[] memory) {
        return getContentsByCondition("");
    }

    // Function to get contents by content type
    function getContentsByContentType(string memory _contentType) public view returns (Content[] memory) {
        return getContentsByCondition(_contentType);
    }

    // Private function to get contents by condition
    function getContentsByCondition(string memory _condition) private view returns (Content[] memory) {
        uint256 existingContentCount = 0;
        for (uint256 i = 1; i < nextContentId; i++) {
            if (contents[i].exists && (keccak256(bytes(_condition)) == keccak256(bytes("")) || keccak256(bytes(contents[i].contentType)) == keccak256(bytes(_condition)))) {
                existingContentCount++;
            }
        }

        Content[] memory matchingContents = new Content[](existingContentCount);
        uint256 index = 0;
        for (uint256 I = 1; I < nextContentId; I++) {
            if (contents[I].exists && (keccak256(bytes(_condition)) == keccak256(bytes("")) || keccak256(bytes(contents[I].contentType)) == keccak256(bytes(_condition)))) {
                matchingContents[index] = contents[I];
                index++;
            }
        }

        return matchingContents;
    }

    // Function to protect the contract
    function protectContract() public onlyOwner {
        isProtected = true;
    }

    // Function to check if the contract is protected
    function isContractProtected() public view returns (bool) {
        return isProtected;
    }

    // Function to withdraw any Ether sent to the contract
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    // Function to receive Ether
    receive() external payable {}

    // Function to withdraw any ERC20 tokens sent to the contract
    function withdrawToken(IERC20 _token) public onlyOwner {
        uint256 balance = _token.balanceOf(address(this));
        _token.transfer(owner(), balance);
    }

    // Function to receive ERC20 tokens
    function receiveToken(IERC20 _token, uint256 _amount) public onlyOwner {
        uint256 balanceBefore = _token.balanceOf(address(this));
        _token.transferFrom(msg.sender, address(this), _amount);
        uint256 balanceAfter = _token.balanceOf(address(this));
        require(balanceAfter - balanceBefore == _amount, "Transfer amount doesn't match");
    }

    // Fallback function
    fallback() external payable {}
}