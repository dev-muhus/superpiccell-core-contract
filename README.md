# SuperPiccellCore Project

This project is a demonstration of a full-stack dApp (decentralized application). The dApp allows for the creation and management of content on the Ethereum blockchain. It also provides a frontend built with React and Next.js for interacting with the smart contract and viewing the content.

## Features

- Deployment of a smart contract to the Ethereum blockchain using Hardhat and ethers.js
- Creation and management of content on the blockchain
- Fetching and displaying the content on a React/Next.js frontend

## Technologies Used

- Hardhat
- ethers.js
- React
- Next.js


## Development Environment (Docker)

### Frontend container

#### Set up container

```shell
docker compose exec frontend bash
```

```shell
npm ci
```

#### Frontend App Url

`http://localhost:3000/`

**Note:** The port number is provided as an example. It can be changed in the `.env` file.

### App container

#### Set up container

```shell
docker compose exec app bash
```

```shell
npm ci
```

#### Container build & launch

```shell
docker compose up -d
```

#### Hardhat

##### Compile

```shell
npx hardhat compile
```

##### Test

```shell
npx hardhat test
```


## Key Scripts

To run the main tasks, use the following commands:

### Deploy the contract:

```shell
npx ts-node scripts/deploy.ts
```

### Manage contents:

Create content:

```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action create --jsonFilePath /path/to/your/jsonfile.json
```

### Protect the contract:

Switch the contract to protected mode:

```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action protect
```

Check if the contract is in protected mode:

```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action checkContractProtection
```

Protect a specific content:

```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action protectContent --contentId 0
```

Check if a specific content is protected:

```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action checkContentProtection --contentId 0
```

Delete a specific content:

```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action delete --contentId 1
```

### Fetch all contents:

```shell
npx ts-node scripts/fetch.ts --contractAddress 0xContractAddress
```

### Fetch contents with a specific contentType:

```shell
npx ts-node scripts/fetch.ts --contractAddress 0xContractAddress --contentType Character
```

### Fetch a single content:

```shell
npx ts-node scripts/fetch.ts --contractAddress 0xContractAddress --contentId 0
```
