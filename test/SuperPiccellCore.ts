import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("SuperPiccellCore contract", function () {
    let SuperPiccellCore;
    let superPiccellCore: Contract;
    let owner: Signer;
    let addr1: Signer;
    let erc20Mock: Contract;

    beforeEach(async () => {
        SuperPiccellCore = await ethers.getContractFactory("SuperPiccellCore");
        [owner, addr1] = await ethers.getSigners();
        superPiccellCore = await SuperPiccellCore.connect(owner).deploy();

        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        erc20Mock = await ERC20Mock.deploy("Test Token", "TT");
        await erc20Mock.mint(await owner.getAddress(), 1000);
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
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await expect(superPiccellCore.updateContent(1, "New content"))
            .to.emit(superPiccellCore, "ContentUpdated")
            .withArgs(1, "New content");
    });

    it("Should not be able to update the content when protected", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await superPiccellCore.protectContract();
        await expect(superPiccellCore.updateContent(1, "New content"))
            .to.be.revertedWith("Contract is protected");
    });

    it("Should be able to delete the content", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await expect(superPiccellCore.deleteContent(1))
            .to.emit(superPiccellCore, "ContentDeleted")
            .withArgs(1);
    });

    it("Should not be able to delete the content when protected", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await superPiccellCore.protectContract();
        await expect(superPiccellCore.deleteContent(1))
            .to.be.revertedWith("Contract is protected");
    });

    it("Should be able to get all contents", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Character", "Content 2", "Genesis");
        const contents = await superPiccellCore.getAllContents();
        expect(contents.length).to.equal(2);
        expect(contents[0].content).to.equal("Content");
        expect(contents[1].content).to.equal("Content 2");
    });

    it("Should be able to get contents by content type", async function () {
        await superPiccellCore.createContent("UTF-8", "Location", "Content 1", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Character", "Content 2", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Scene", "Content 3", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Scene", "Content 4", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Scene", "Content 5", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Location", "Content 6", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Character", "Content 7", "Genesis");
        const contents = await superPiccellCore.getContentsByContentType("Character");
        expect(contents.length).to.equal(2);
        expect(contents[0].content).to.equal("Content 2");
    });

    it("Should return the correct content when using getContent", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        const content = await superPiccellCore.getContent(1);
        expect(content.content).to.equal("Content");
    });

    it("Should return true if the contract is protected", async function () {
        await superPiccellCore.protectContract();
        const isProtected = await superPiccellCore.isContractProtected();
        expect(isProtected).to.be.true;
    });

    it("Should reject incoming Ether", async function () {
        await expect(owner.sendTransaction({
            to: superPiccellCore.address,
            value: ethers.utils.parseEther("1")
        })).to.be.revertedWith("Contract does not accept Ether or tokens");
    });

    it("Should allow ERC20 token withdrawal", async function () {
        await erc20Mock.transfer(superPiccellCore.address, 100);
        const initialBalance = await erc20Mock.balanceOf(await addr1.getAddress());

        await expect(superPiccellCore.withdrawToken(erc20Mock.address, 100, await addr1.getAddress()))
            .to.emit(superPiccellCore, "TokenWithdrawn")
            .withArgs(erc20Mock.address, 100, await addr1.getAddress());

        const finalBalance = await erc20Mock.balanceOf(await addr1.getAddress());
        expect(finalBalance.sub(initialBalance)).to.equal(100);
    });

    it("Should reject ERC20 token transfers if transfer amount exceeds balance", async function () {
        await erc20Mock.transfer(superPiccellCore.address, 100);

        await expect(superPiccellCore.withdrawToken(erc20Mock.address, 200, await addr1.getAddress()))
            .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should not allow non-owner to withdraw tokens", async function () {
        await erc20Mock.transfer(superPiccellCore.address, 100);

        await expect(superPiccellCore.connect(addr1).withdrawToken(erc20Mock.address, 100, await addr1.getAddress()))
            .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail to withdraw ERC20 tokens if transfer returns false", async function () {
        await erc20Mock.transfer(superPiccellCore.address, 100);
        await erc20Mock.setTransferFail(true);

        await expect(superPiccellCore.withdrawToken(erc20Mock.address, 100, await addr1.getAddress()))
            .to.be.revertedWith("Transfer failed");

        await erc20Mock.setTransferFail(false); // 状態を元に戻す
    });

    it("Should correctly track the number of contents", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await superPiccellCore.createContent("UTF-8", "Character", "Content 2", "Genesis");
        const content1 = await superPiccellCore.getContent(1);
        const content2 = await superPiccellCore.getContent(2);

        expect(content1.content).to.equal("Content");
        expect(content2.content).to.equal("Content 2");
    });

    it("Should correctly update existing content", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await superPiccellCore.updateContent(1, "Updated Content");
        const content = await superPiccellCore.getContent(1);

        expect(content.content).to.equal("Updated Content");
    });

    it("Should not update content if it does not exist", async function () {
        await expect(superPiccellCore.updateContent(99, "Non-existent Content"))
            .to.be.revertedWith("Content does not exist");
    });

    it("Should not delete content if it does not exist", async function () {
        await expect(superPiccellCore.deleteContent(99))
            .to.be.revertedWith("Content does not exist");
    });

    it("Should emit event when content is created", async function () {
        await expect(superPiccellCore.createContent("UTF-8", "Character", "New Content", "Genesis"))
            .to.emit(superPiccellCore, "ContentCreated")
            .withArgs(1, "New Content");
    });

    it("Should emit event when content is updated", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await expect(superPiccellCore.updateContent(1, "Updated Content"))
            .to.emit(superPiccellCore, "ContentUpdated")
            .withArgs(1, "Updated Content");
    });

    it("Should emit event when content is deleted", async function () {
        await superPiccellCore.createContent("UTF-8", "Character", "Content", "Genesis");
        await expect(superPiccellCore.deleteContent(1))
            .to.emit(superPiccellCore, "ContentDeleted")
            .withArgs(1);
    });
});
