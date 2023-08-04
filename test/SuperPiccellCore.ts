
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("SuperPiccellCore contract", function () {
  let SuperPiccellCore;
  let superPiccellCore: Contract;
  let owner: Signer;
  let addr1: Signer;

  beforeEach(async () => {
    SuperPiccellCore = await ethers.getContractFactory("SuperPiccellCore");
    [owner, addr1] = await ethers.getSigners();
    superPiccellCore = await SuperPiccellCore.connect(owner).deploy();
  });

  it("Should be able to create a new content", async function () {
    await expect(superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    )).to.emit(superPiccellCore, "ContentCreated").withArgs(1, "Content");
  });

  it("Should not be able to create a new content when protected", async function () {
    await superPiccellCore.protectContract();
    await expect(superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    )).to.be.revertedWith("Contract is protected");
  });

  it("Should be able to update the content", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    await expect(superPiccellCore.updateContent(1, "New content")).to.emit(superPiccellCore, "ContentUpdated").withArgs(1, "New content");
  });

  it("Should not be able to update the content when protected", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    await superPiccellCore.protectContract();
    await expect(superPiccellCore.updateContent(1, "New content")).to.be.revertedWith("Contract is protected");
  });

  it("Should be able to delete the content", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    await expect(superPiccellCore.deleteContent(1)).to.emit(superPiccellCore, "ContentDeleted").withArgs(1);
  });

  it("Should not be able to delete the content when protected", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    await superPiccellCore.protectContract();
    await expect(superPiccellCore.deleteContent(1)).to.be.revertedWith("Contract is protected");
  });

  it("Should be able to get all contents", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content 2",
      "Genesis"
    );
    let contents = await superPiccellCore.getAllContents();
    expect(contents.length).to.equal(2);
  });

  it("Should be able to get contents by content type", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content 2",
      "Genesis"
    );
    let contents = await superPiccellCore.getContentsByContentType("Character");
    expect(contents.length).to.equal(2);
    expect(contents[0].content).to.equal("Content");
    expect(contents[1].content).to.equal("Content 2");
  });

  it("Should return empty array if no matching content type found", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    let contents = await superPiccellCore.getContentsByContentType("Nonexistent");
    expect(contents.length).to.equal(0);
  });

  it("Should be able to get a content by id", async function () {
    await superPiccellCore.createContent(
      "UTF-8",
      "Character",
      "Content",
      "Genesis"
    );
    let content = await superPiccellCore.getContent(1);
    expect(content.content).to.equal("Content");
  });

  it("Should return error if getting a content by id that does not exist", async function () {
    await expect(superPiccellCore.getContent(9999)).to.be.revertedWith("Content does not exist");
  });

  it("Should be able to receive and withdraw Ether", async function () {
    await owner.sendTransaction({ to: superPiccellCore.address, value: ethers.utils.parseEther("1") });
    expect(await ethers.provider.getBalance(superPiccellCore.address)).to.equal(ethers.utils.parseEther("1"));
    await superPiccellCore.connect(owner).withdraw();
    expect(await ethers.provider.getBalance(superPiccellCore.address)).to.equal(0);
  });

  it("Should be able to receive and withdraw ERC20 tokens", async function () {
    // Get the contract instance of the mock ERC20 token
    const ERC20 = await ethers.getContractFactory("ERC20Mock");
    const erc20 = await ERC20.deploy("Mock Token", "MTK");
  
    // Mint some tokens to the owner
    await erc20.mint(await owner.getAddress(), ethers.utils.parseEther("100"));
  
    // Transfer tokens to the contract
    await erc20.connect(owner).approve(superPiccellCore.address, ethers.utils.parseEther("50"));
    await superPiccellCore.receiveToken(erc20.address, ethers.utils.parseEther("50"));
  
    // Check the token balance of the contract
    expect(await erc20.balanceOf(superPiccellCore.address)).to.equal(ethers.utils.parseEther("50"));
  
    // Withdraw the tokens
    await superPiccellCore.withdrawToken(erc20.address);
  
    // Check the token balance of the contract again
    expect(await erc20.balanceOf(superPiccellCore.address)).to.equal(0);
  });
});
