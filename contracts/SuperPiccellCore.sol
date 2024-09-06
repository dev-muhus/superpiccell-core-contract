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
    mapping(uint256 => bool) public protectedContents; // Mapping to track if content is protected
    uint256 public nextContentId = 1;
    bool public isProtected = false;

    // Events
    event ContentCreated(uint256 id, string content);
    event ContentUpdated(uint256 id, string newContent);
    event ContentDeleted(uint256 id);
    event TokenWithdrawn(address token, uint256 amount, address to);
    event ContentProtected(uint256 id); // Event for content protection

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
        require(!protectedContents[id], "Content is protected"); // Check if the content is protected
        content.content = _content;
        content.updatedAt = block.timestamp;
        content.updatedBy = msg.sender;
        emit ContentUpdated(id, _content);
    }

    // Function to delete the content
    function deleteContent(uint256 id) public onlyOwner {
        require(!isProtected, "Contract is protected");
        Content storage content = contents[id];
        require(content.exists, "Content does not exist");
        require(!protectedContents[id], "Content is protected"); // Check if the content is protected
        content.exists = false;
        emit ContentDeleted(id);
    }

    // Function to protect a content permanently
    function protectContent(uint256 id) public onlyOwner {
        require(!isProtected, "Contract is protected"); // Check if the contract is protected
        Content storage content = contents[id];
        require(content.exists, "Content does not exist");
        require(!protectedContents[id], "Content is already protected");
        protectedContents[id] = true;
        emit ContentProtected(id);
    }

    // Function to check if content is protected
    function isContentProtected(uint256 id) public view returns (bool) {
        require(contents[id].exists, "Content does not exist");
        return protectedContents[id];
    }

    // Function to get the content
    function getContent(uint256 id) public view returns (Content memory) {
        require(contents[id].exists, "Content does not exist");
        return contents[id];
    }

    // Function to get all contents
    function getAllContents() public view returns (Content[] memory) {
        uint count = nextContentId - 1;
        Content[] memory allContents = new Content[](count);
        uint index = 0;
        for (uint i = 1; i <= count; i++) {
            if (contents[i].exists) {
                allContents[index] = contents[i];
                index++;
            }
        }
        return allContents;
    }

    // Function to get contents by content type
    function getContentsByContentType(string memory _contentType) public view returns (Content[] memory) {
        uint count = nextContentId - 1;
        uint matchCount = 0;
        for (uint i = 1; i <= count; i++) {
            if (contents[i].exists && keccak256(bytes(contents[i].contentType)) == keccak256(bytes(_contentType))) {
                matchCount++;
            }
        }

        Content[] memory matchingContents = new Content[](matchCount);
        uint index = 0;
        for (uint i = 1; i <= count; i++) {
            if (contents[i].exists && keccak256(bytes(contents[i].contentType)) == keccak256(bytes(_contentType))) {
                matchingContents[index] = contents[i];
                index++;
            }
        }
        return matchingContents;
    }

    // Function to check if the contract is protected
    function isContractProtected() public view returns (bool) {
        return isProtected;
    }

    // Function to protect the contract
    function protectContract() public onlyOwner {
        isProtected = true;
    }

    // Function to withdraw accidentally received ERC20 tokens
    function withdrawToken(IERC20 _token, uint256 _amount, address _to) public onlyOwner {
        require(_token.transfer(_to, _amount), "Transfer failed");
        emit TokenWithdrawn(address(_token), _amount, _to);
    }

    // Fallback function to prevent receiving Ether
    fallback() external payable {
        revert("Contract does not accept Ether or tokens");
    }

    receive() external payable {
        revert("Contract does not accept Ether or tokens");
    }
}
