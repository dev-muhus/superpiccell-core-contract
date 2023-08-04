import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const privateKey: string = process.env.PRIVATE_KEY ?? "";
    if (privateKey === "") {
        throw new Error('No value set for environment variable PRIVATE_KEY');
    }
    const rpcUrl: string = process.env.NETWORK_URL ?? "";
    if (rpcUrl === "") {
        throw new Error('No value set for environment variable NETWORK_URL');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    
    const artifact = require("../artifacts/contracts/SuperPiccellCore.sol/SuperPiccellCore.json");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    
    const superPiccellCore = await factory.deploy();
    
    console.log(`SuperPiccellCore contract deploy address ${superPiccellCore.address}`);
    console.log(`Transaction URL: https://${process.env.NETWORK_NAME}.etherscan.io/tx/${superPiccellCore.deployTransaction.hash}`);
    await superPiccellCore.deployed();
    console.log(`Deploy completed`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
