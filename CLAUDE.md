# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 厳格ルール

### 必須事項
- **全てのnpmコマンドはDockerコンテナ内で実行すること**
  - バックエンド: `docker compose exec app bash` → `npm [command]`
  - フロントエンド: `docker compose exec frontend bash` → `npm [command]`
- ホストマシンで直接npmコマンドを実行してはいけない

### フロントエンド開発コマンド
```bash
# フロントエンド開発サーバー起動
docker compose exec frontend bash
npm run dev

# フロントエンドビルド
docker compose exec frontend bash
npm run build

# フロントエンドリント
docker compose exec frontend bash
npm run lint
```

## Essential Commands

### Development Environment Setup
```bash
# Build and start Docker containers
docker compose up -d

# Install dependencies (run inside containers)
docker compose exec app bash
npm ci

docker compose exec frontend bash
npm ci
```

### Contract Deployment
```bash
npx tsx scripts/deploy.ts
```

### Content Management
```bash
# Create content from JSON file
npx tsx scripts/manage.ts --contractAddress 0x[ADDRESS] --action create --jsonFilePath /path/to/file.json

# Delete content
npx tsx scripts/manage.ts --contractAddress 0x[ADDRESS] --action delete --contentId [ID]

# Protect contract (makes it read-only)
npx tsx scripts/manage.ts --contractAddress 0x[ADDRESS] --action protect

# Protect specific content
npx tsx scripts/manage.ts --contractAddress 0x[ADDRESS] --action protectContent --contentId [ID]

# Check protection status
npx tsx scripts/manage.ts --contractAddress 0x[ADDRESS] --action checkContractProtection
npx tsx scripts/manage.ts --contractAddress 0x[ADDRESS] --action checkContentProtection --contentId [ID]
```

### Fetching Content
```bash
# Fetch all contents
npx tsx scripts/fetch.ts --contractAddress 0x[ADDRESS]

# Fetch by content type
npx tsx scripts/fetch.ts --contractAddress 0x[ADDRESS] --contentType Character

# Fetch single content
npx tsx scripts/fetch.ts --contractAddress 0x[ADDRESS] --contentId [ID]
```

### Testing
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/SuperPiccellCore.ts
```

### Contract Verification
```bash
# Verify on Etherscan (requires ETHERSCAN_API_KEY in .env)
npx hardhat verify --network sepolia [CONTRACT_ADDRESS]
```

## Architecture Overview

### Smart Contract System
The core is `SuperPiccellCore.sol` which implements a content management system with:
- Content struct storing: id, encoding, contentType, content, revision, timestamps, and creator/updater addresses
- Two-level protection system:
  1. Contract-level protection (`isProtected`): Makes entire contract read-only
  2. Content-level protection (`protectedContents`): Makes individual content items immutable
- Owner-only write operations using OpenZeppelin's Ownable
- ERC20 token recovery functionality for accidentally sent tokens

### Content Types
The system manages various content types found in `scripts/import/`:
- Characters
- Episodes  
- Events
- Items
- Locations
- Organizations

### Frontend Architecture
- Next.js application in `frontend/` directory
- Uses ethers.js v6 for blockchain interaction
- Fetches and displays content from the smart contract
- Separate configuration via `frontend/.env.local`

### Development Environment
- Docker Compose setup with two services: `app` (backend) and `frontend`
- Hardhat configuration targets Sepolia testnet
- TypeScript for all scripts and tests
- Uses Hardhat's built-in testing framework with Chai assertions

## Key Configuration Files

### Environment Variables
Two separate `.env` files are required:

1. Root `.env`: Backend configuration (private key, RPC URL, network name)
2. `frontend/.env.local`: Frontend configuration (contract address, network ID)

### Network Configuration
- Configured for Sepolia testnet in `hardhat.config.ts`
- Solidity compiler version: 0.8.21
- Etherscan integration for contract verification

## Dependency Notes

`package.json` cannot hold comments, so the reasons for non-obvious pins are recorded here.

- **`overrides.zod` (root)**: Hardhat 3 declares `zod ^3`, but GHSA-mrhx-c7xc-m3w5 is only fixed in 4.x. Hardhat uses zod solely to validate the local `hardhat.config.ts`. Side effect: an invalid config still aborts, but prints `TypeError: Cannot read properties of undefined (reading 'map')` from `validateUserConfigZodType` instead of a validation message. If you see that error, check `hardhat.config.ts`. Remove the override once Hardhat supports zod 4.
- **`overrides.mocha` (root) / `overrides.minimatch@>=7.0.0` (frontend)**: force patched `glob` and `minimatch` (GHSA-3g3m-2fjr-6pw4, GHSA-g3hv-75wg-m249). Remove once the parent packages depend on patched versions.
- **`overrides.eslint` (frontend)**: `eslint-plugin-react` and related plugins do not declare ESLint 10 in their peer ranges yet. Remove once they do.
- **React 18.3.1 (frontend)**: kept deliberately. React 19 adds about 23.5 kB gzip to the page with no security gain today. Next.js 16 warns that React 18 is deprecated and Next.js 17 removes support, so upgrade React before moving to Next.js 17.
- **`frontend/src/utils/SuperPiccellCore.json`**: ABI only, to keep bytecode out of the client bundle. It is older than the current contract source (for example it has `withdraw` but not `protectContent`); the client only calls `getAllContents`, whose struct matches.
- **Secrets**: `.env` holds a real private key, so run tests and local checks without it where possible. `npx hardhat test` needs no secrets.
