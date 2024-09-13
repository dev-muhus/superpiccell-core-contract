
# SuperPiccellCore Project

This project is a demonstration of a full-stack dApp (decentralized application). The dApp allows for the creation and management of content on the Ethereum blockchain. It also provides a frontend built with React and Next.js for interacting with the smart contract and viewing the content.

## Features

- Deployment of a smart contract to the Ethereum blockchain using Hardhat and ethers.js
- Creation and management of content on the blockchain
- Fetching and displaying the content on a React/Next.js frontend

## Prerequisites

- Node.js (v14 or higher)
- Docker
- MetaMask extension

## Setup Instructions

### 1. Clone the Repository
```bash
git clone git@github.com:dev-muhus/superpiccell-core-contract.git
cd superpiccell-core-contract
```

### 2. Set Up Environment Variables

There are **two environment variable files** to configure:

#### `.env` (for backend configuration):
```bash
COMPOSE_PROJECT_NAME=superpiccell_core
FRONTEND_PORT=8080
NODE_ENV=development

PRIVATE_KEY=<your_private_key>
NETWORK_URL=<your_backend_rpc_url>
NETWORK_NAME=<your_network>
```

#### `frontend/.env.local` (for frontend configuration):
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_contract_address>
NEXT_PUBLIC_NETWORK_ID=<your_network_id>
NEXT_PUBLIC_NETWORK_NAME=<your_network_name>
```

### 3. Build and Launch Docker Containers
```bash
docker compose up -d
```

### 4. Install Dependencies Inside the Container

For the backend:

```bash
docker compose exec app bash
npm ci
```

For the frontend:

```bash
docker compose exec frontend bash
npm ci
```

### 5. Start the Application
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Example Commands

To run the main tasks, use the following commands:

### Deploy the contract:

```shell
npx ts-node scripts/deploy.ts
```

### Manage contents:

- Create content:
```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action create --jsonFilePath /path/to/your/jsonfile.json
```

- Delete content:
```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action delete --contentId 1
```

### Protect and Check Protection:

- Switch the contract to protected mode:
```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action protect
```

- Check if the contract is in protected mode:
```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action checkContractProtection
```

- Protect a specific content:
```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action protectContent --contentId 0
```

- Check if a specific content is protected:
```shell
npx ts-node scripts/manage.ts --contractAddress 0xContractAddress --action checkContentProtection --contentId 0
```

### Fetch contents:

- Fetch all contents:
```shell
npx ts-node scripts/fetch.ts --contractAddress 0xContractAddress
```

- Fetch contents with a specific contentType:
```shell
npx ts-node scripts/fetch.ts --contractAddress 0xContractAddress --contentType Character
```

- Fetch a single content:
```shell
npx ts-node scripts/fetch.ts --contractAddress 0xContractAddress --contentId 0
```

## Frontend Components

### `index.js`
Handles the main app logic and UI rendering.

### `fetchContents.js`
Fetches contents from the blockchain using ethers.js.

## Contracts

### `SuperPiccellCore.sol`
Main contract for content management and protection.

### `ERC20Mock.sol`
A mock ERC20 contract for testing.

## Testing

### Run Tests
```bash
npx hardhat test
```

## License

This project is licensed under the Unlicense. For more details, see the [LICENSE](LICENSE) file.

## Etherscan Contract Verification (Automated)

This project supports automated contract verification on Etherscan. After deploying your contracts, you can easily verify them using the following command:

### Verify Contracts
```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

Before running this command, ensure your `.env` file is properly configured with your Etherscan API key:

```bash
ETHERSCAN_API_KEY=<your_etherscan_api_key>
```

By running the above command, the contract will be automatically verified and published on Etherscan, including all related source code and dependencies.
