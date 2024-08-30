import { ethers } from 'ethers';
import { ContractTransaction } from '@ethersproject/contracts';
import { readFileSync } from "fs";
import { program, Option } from 'commander';
import * as dotenv from 'dotenv';
dotenv.config();

function readJsonContent(filePath: string) {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

async function main(contractAddress: string, action: string, jsonFilePath: string | null, contentId: number | null) {
    const privateKey: string = process.env.PRIVATE_KEY ?? "";
    const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
    const signer = new ethers.Wallet(privateKey, provider);

    const artifact = require("../artifacts/contracts/SuperPiccellCore.sol/SuperPiccellCore.json");
    const superPiccellCore = new ethers.Contract(contractAddress, artifact.abi, signer);

    if (action === "protect") {
        const tx: ContractTransaction = await superPiccellCore.protectContract();
        const receipt = await tx.wait();
        console.log("Contract protected successfully");
    } else if (action === "checkContractProtection") {
        const isProtected = await superPiccellCore.isContractProtected();
        console.log("Contract is protected:", isProtected);
    } else if (action === "protectContent") {
        if (contentId === null) {
            console.error("No content ID provided for protectContent action");
            return;
        }
        const tx: ContractTransaction = await superPiccellCore.protectContent(contentId);
        const receipt = await tx.wait();
        console.log(`Content with ID ${contentId} protected successfully`);
    } else if (action === "checkContentProtection") {
        if (contentId === null) {
            console.error("No content ID provided for checkContentProtection action");
            return;
        }
        const isProtected = await superPiccellCore.isContentProtected(contentId);
        console.log(`Content with ID ${contentId} is protected:`, isProtected);
    } else if (action === "delete") {
        if (contentId === null) {
            console.error("No content ID provided for delete action");
            return;
        }
        const tx: ContractTransaction = await superPiccellCore.deleteContent(contentId);
        const receipt = await tx.wait();
        console.log(`Content with ID ${contentId} deleted successfully`);
    } else {
        if (!jsonFilePath) {
            console.error("No JSON file path provided for create or update action");
            return;
        }

        const contents = readJsonContent(jsonFilePath);

        for (let content of contents) {
            if (action === "create") {
                const contentString = JSON.stringify(content.content);
                const tx: ContractTransaction = await superPiccellCore.createContent(content.encoding, content.contentType, contentString, content.revision);
                const receipt = await tx.wait();
                console.log("Content created successfully");
            } else if (action === "update") {
                if (!content.id) {
                    console.error("No content ID provided in JSON for update");
                    return;
                }
                const contentString = JSON.stringify(content.content);
                const tx: ContractTransaction = await superPiccellCore.updateContent(content.id, contentString);
                const receipt = await tx.wait();
                console.log("Content updated successfully");
            } else {
                throw new Error("Invalid action. Valid actions are 'create', 'update', 'delete', 'protect', 'protectContent', 'checkContractProtection', and 'checkContentProtection'.");
            }
        }
    }
}

program
    .addOption(new Option('--contractAddress <address>', 'address of SuperPiccellCore contract').makeOptionMandatory())
    .addOption(new Option('--action <string>', 'action to perform on the content').choices(['create', 'update', 'delete', 'protect', 'protectContent', 'checkContractProtection', 'checkContentProtection']).makeOptionMandatory())
    .addOption(new Option('--jsonFilePath <path>', 'path to the JSON file containing the content data'))
    .addOption(new Option('--contentId <contentId>', 'Content ID for delete, protectContent, or checkContentProtection actions').argParser(parseInt))
    .parse();

const options = program.opts();
const { contractAddress, action, jsonFilePath, contentId } = options;

main(contractAddress, action, jsonFilePath, contentId).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
