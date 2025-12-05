# x402 Multi-Facilitator Merchant Demo

A merchant server implementing the **x402 payment protocol** with **multiple facilitators** for cross-chain micropayments. This demo showcases how AI agents can pay for API access using USDC across different blockchain networks.

## 🌟 Features

- **Multi-Facilitator Support** - Use different payment facilitators for different endpoints
- **Cross-Chain Payments** - Support for EVM (Base) and Solana networks
- **Pay-Per-Use APIs** - Monetize your APIs with micropayments
- **Agent-to-Agent Commerce** - Built for AI agent interactions

## Supported Facilitators

| Facilitator | Network | Status | Documentation |
|-------------|---------|--------|---------------|
| [PayAI](https://facilitator.payai.network) | Base Sepolia | ✅ Tested | [Docs](https://docs.payai.network) |
| [Coinbase CDP](https://docs.cdp.coinbase.com/x402) | Base Sepolia, Base | ✅ Production Ready | [Docs](https://docs.cdp.coinbase.com/x402) |
| [Heurist](https://facilitator.heurist.xyz) | Base (Mainnet) | ⚠️ Mainnet Only | [Docs](https://docs.heurist.ai/x402-products/facilitator) |
| [Daydreams](https://facilitator.daydreams.systems) | Base, Solana | ⚠️ Mainnet Only | - |
| [Dexter](https://dexter.cash/facilitator) | Solana | ⚠️ Solana Required | - |

> **Note:** For testnet testing, PayAI and Coinbase are the recommended facilitators. Other facilitators may require mainnet deployment or specific network configurations.

## Overview

The x402 protocol enables pay-per-use API transactions between agents. When a client agent requests a protected resource without payment, the server returns HTTP 402 with payment requirements. The client can then submit a signed payment authorization to access the resource.

### How It Works

```
┌─────────────────┐                    ┌─────────────────┐
│  Client Agent   │                    │  Merchant Server │
└────────┬────────┘                    └────────┬─────────┘
         │                                      │
         │  1. Request protected resource       │
         │─────────────────────────────────────>│
         │                                      │
         │  2. HTTP 402 + payment requirements  │
         │<─────────────────────────────────────│
         │                                      │
         │  3. Sign payment + retry with        │
         │     X-PAYMENT header                 │
         │─────────────────────────────────────>│
         │                                      │
         │         ┌─────────────────┐          │
         │         │   Facilitator   │          │
         │         │(PayAI/Coinbase/ │          │
         │         │Heurist/Daydreams│          │
         │         │    /Dexter)     │          │
         │         └────────┬────────┘          │
         │                  │                   │
         │  4. Verify & settle payment          │
         │                  │<─────────────────>│
         │                  │                   │
         │  5. Return resource + payment receipt│
         │<─────────────────────────────────────│
         │                                      │
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=4021

# Payment Addresses
EVM_ADDRESS=0xYourEVMWalletAddress          # For Base Sepolia
SOLANA_ADDRESS=YourSolanaWalletAddress      # For Solana

# Client Configuration (for testing)
MERCHANT_URL=http://localhost:4021
EVM_PRIVATE_KEY=0xYourEVMPrivateKey         # DO NOT COMMIT!
SOLANA_PRIVATE_KEY=YourSolanaPrivateKey     # DO NOT COMMIT!
```

### 3. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:4021`.

## API Endpoints

### Public Endpoints (Free)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server info and available endpoints |
| GET | `/health` | Health check with facilitator status |

### Protected Endpoints (Payment Required)

| Method | Endpoint | Price | Facilitator | Network |
|--------|----------|-------|-------------|---------|
| GET | `/api/weather` | $0.001 | PayAI | Base Sepolia |
| POST | `/api/ai/image` | $0.02 | Heurist | Base Sepolia |
| POST | `/api/agent/task` | $0.01 | Daydreams | Base Sepolia |
| GET | `/api/data` | $0.005 | Coinbase | Base Sepolia |
| POST | `/api/compute` | $0.05 | Dexter | Solana |

## Testing

### Run the Test Client

```bash
npm run dev:client
```

The client will test all endpoints and show payment flow for each facilitator.

### Expected Results

- **PayAI (Weather)** - ✅ Should work on Base Sepolia testnet
- **Coinbase (Data)** - ✅ Should work on Base Sepolia testnet
- **Heurist (AI Image)** - ⚠️ May require mainnet (`base` instead of `base-sepolia`)
- **Daydreams (Agent Task)** - ⚠️ May require mainnet or Solana
- **Dexter (Compute)** - ⚠️ Requires Solana private key

### Manual Testing with cURL

```bash
# Free endpoint
curl http://localhost:4021/health

# Paid endpoint (will return 402 without payment)
curl http://localhost:4021/api/weather
```

## x402 Payment Flow

### 402 Response Format

When accessing a protected endpoint without payment:

```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "1000",
    "resource": "http://localhost:4021/api/weather",
    "description": "Get current weather data",
    "payTo": "0x...",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "maxTimeoutSeconds": 60
  }]
}
```

### Payment Header

Clients submit payment via the `X-PAYMENT` header containing a base64-encoded payment payload with EIP-3009 authorization.

### Payment Response

Successful payments include an `X-PAYMENT-RESPONSE` header with transaction details.

## Project Structure

```
.
├── src/
│   ├── index.ts      # Multi-facilitator merchant server
│   └── client.ts     # Test client for all facilitators
├── .env.example      # Environment configuration template
├── .env              # Your local configuration (git ignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start merchant server in development mode |
| `npm run dev:client` | Run test client for all facilitators |
| `npm run build` | Build for production |
| `npm start` | Run production build |

## Facilitator Details

### PayAI
- **URL:** `https://facilitator.payai.network`
- **Networks:** Base Sepolia (testnet), Base (mainnet)
- **Status:** ✅ Fully tested on testnet

### Coinbase CDP
- **Package:** `@coinbase/x402`
- **Networks:** Base Sepolia (testnet), Base (mainnet), Solana, Solana Devnet
- **Status:** ✅ Official Coinbase Developer Platform facilitator (production-ready)
- **API Key:** Required (`CDP_API_KEY_ID` and `CDP_API_KEY_SECRET` env vars)
- **Features:** KYT/OFAC compliance, fee-free USDC, x402 Bazaar discovery
- **Docs:** [https://docs.cdp.coinbase.com/x402](https://docs.cdp.coinbase.com/x402)

### Heurist
- **URL:** `https://facilitator.heurist.xyz`
- **Networks:** Base (mainnet), XLayer
- **Status:** ⚠️ Docs mention Base Sepolia support, but API currently shows mainnet only
- **Docs:** [https://docs.heurist.ai/x402-products/facilitator](https://docs.heurist.ai/x402-products/facilitator)

### Daydreams
- **URL:** `https://facilitator.daydreams.systems`
- **Networks:** Base, Abstract, Polygon, Starknet, Solana
- **Status:** ⚠️ No testnet support - mainnet or Solana required

### Dexter
- **URL:** `https://dexter.cash/facilitator`
- **Networks:** Solana
- **Status:** ⚠️ Requires Solana wallet and private key

## Resources

- [x402 Protocol Specification](https://www.x402.org)
- [PayAI Documentation](https://docs.payai.network)
- [Heurist Documentation](https://docs.heurist.ai/x402-products/facilitator)
- [Coinbase x402 Quickstart](https://docs.cdp.coinbase.com/x402/quickstart-for-sellers)

## License

ISC
