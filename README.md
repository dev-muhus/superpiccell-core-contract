# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

```
2023-07-31 Sepolia
npx ts-node scripts/deploy.ts
SuperPiccellCore contract deploy address 0x3bcCa64ba3DF10df521D12C954E7eB7349700924
Transaction URL: https://sepolia.etherscan.io/tx/0x7e0b22161c76384ab2fa922d66ed86d644c62a60519940beaa91b92d81a6464a
Deploy completed
```

## Manage contents

`npx ts-node scripts/manage.ts --contractAddress 0xYourContractAddress --action create --jsonFilePath /path/to/your/jsonfile.json`

# Fetch all contents
`npx ts-node scripts/fetch.ts --contractAddress 0xYourContractAddress`

# Fetch contentType filter contents
`npx ts-node scripts/fetch.ts --contractAddress 0xYourContractAddress --contentType Character`

# Fetch a single content
`npx ts-node scripts/fetch.ts --contractAddress 0xYourContractAddress --contentId 0`
