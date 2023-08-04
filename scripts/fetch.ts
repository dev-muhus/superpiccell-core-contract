
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { program, Option } from 'commander';
import * as dotenv from 'dotenv';
dotenv.config();

function getContractAbi(): any {
    const contractJsonPath = './artifacts/contracts/SuperPiccellCore.sol/SuperPiccellCore.json';
    const contractData = JSON.parse(readFileSync(contractJsonPath, 'utf-8'));
    return contractData.abi;
}

async function main(contractAddress: string, contentId: number, contentType: string | undefined) {
    const privateKey: string = process.env.PRIVATE_KEY ?? "";
    const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
    const signer = new ethers.Wallet(privateKey, provider);

    const abi = getContractAbi();
    const superPiccellCore = new ethers.Contract(contractAddress, abi, signer);

    if (contentId != null) {
        const content = await superPiccellCore.getContent(contentId);
        console.log(`Content ID: ${content.id}`);
        console.log(`Encoding: ${content.encoding}`);
        console.log(`Content Type: ${content.contentType}`);
        console.log(`Content: ${content.content}`);
        console.log(`Revision: ${content.revision}`);
        console.log(`Created At: ${new Date(content.createdAt.toNumber() * 1000)}`);
        console.log(`Updated At: ${new Date(content.updatedAt.toNumber() * 1000)}`);
    } else {
        let totalContents;
        if (contentType) {
            totalContents = await superPiccellCore.getContentsByContentType(contentType);
        } else {
            totalContents = await superPiccellCore.getAllContents();
        }
        for (let i = 0; i < totalContents.length; i++) {
            console.log(`Content ID: ${totalContents[i].id}`);
            console.log(`Encoding: ${totalContents[i].encoding}`);
            console.log(`Content Type: ${totalContents[i].contentType}`);
            console.log(`Content: ${totalContents[i].content}`);
            console.log(`Revision: ${totalContents[i].revision}`);
            console.log(`Created At: ${new Date(totalContents[i].createdAt.toNumber() * 1000)}`);
            console.log(`Updated At: ${new Date(totalContents[i].updatedAt.toNumber() * 1000)}`);
        }
    }
}

program
    .addOption(new Option('--contractAddress <address>', 'address of SuperPiccellCore contract').makeOptionMandatory())
    .addOption(new Option('--contentId <number>', 'id of the content'))
    .addOption(new Option('--contentType <string>', 'content type of the content'))
    .parse();
const options = program.opts();

main(options.contractAddress, options.contentId, options.contentType).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
