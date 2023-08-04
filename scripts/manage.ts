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

async function main(contractAddress: string, action: string, jsonFilePath: string | null) {
    const privateKey: string = process.env.PRIVATE_KEY ?? "";
    const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
    const signer = new ethers.Wallet(privateKey, provider);

    const artifact = require("../artifacts/contracts/SuperPiccellCore.sol/SuperPiccellCore.json");
    const superPiccellCore = new ethers.Contract(contractAddress, artifact.abi, signer);

    if (action === "protect") {
        const tx: ContractTransaction = await superPiccellCore.protectContract();
        const receipt = await tx.wait();
        console.log("Contract protected successfully");
    } else {
        if (!jsonFilePath) {
            console.error("No JSON file path provided for create, update, or delete action");
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
                    console.error("No content ID provided for update");
                    return;
                }
                const contentString = JSON.stringify(content.content);
                const tx: ContractTransaction = await superPiccellCore.updateContent(content.id, contentString);
                const receipt = await tx.wait();
                console.log("Content updated successfully");
            } else if (action === "delete") {
                if (!content.id) {
                    console.error("No content ID provided for delete");
                    return;
                }
                const tx: ContractTransaction = await superPiccellCore.deleteContent(content.id);
                const receipt = await tx.wait();
                console.log("Content deleted successfully");
            } else {
                throw new Error("Invalid action. Valid actions are 'create', 'update', 'delete', and 'protect'.");
            }
        }
    }
}

program
    .addOption(new Option('--contractAddress <address>', 'address of SuperPiccellCore contract').makeOptionMandatory())
    .addOption(new Option('--action <string>', 'action to perform on the content').choices(['create', 'update', 'delete', 'protect']).makeOptionMandatory())
    .addOption(new Option('--jsonFilePath <path>', 'path to the JSON file containing the content data'))
    .parse();
const options = program.opts();

main(options.contractAddress, options.action, options.jsonFilePath).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
