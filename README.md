# x402 Merchant Agent with PayAI Facilitator

A merchant server implementing the x402 payment protocol with PayAI facilitator for Base Sepolia network. This enables AI agents (client agents) to pay for API access using USDC micropayments.

## Overview

The x402 protocol enables pay-per-use API transactions between agents. When a client agent requests a protected resource without payment, the server returns HTTP 402 with payment requirements. The client can then submit a signed payment authorization to access the resource.

### How It Works

1. **Client** requests a protected endpoint
2. **Server** responds with HTTP 402 + payment requirements (price, network, asset)
3. **Client** signs a payment authorization and retries with `X-PAYMENT` header
4. **Server** verifies payment via PayAI facilitator
5. **Server** returns the requested resource
6. **Facilitator** settles payment on-chain

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
# PayAI Facilitator URL
FACILITATOR_URL=https://facilitator.payai.network

# Network - base-sepolia for testnet, base for mainnet
NETWORK=base-sepolia

# Your wallet address to receive payments (USDC)
ADDRESS=0xYourWalletAddressHere

# Server port
PORT=4021
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
| GET | `/health` | Health check |

### Protected Endpoints (Payment Required)

| Method | Endpoint | Price (USDC) | Description |
|--------|----------|--------------|-------------|
| GET | `/api/weather` | $0.001 | Current weather data |
| GET | `/api/analyze` | $0.01 | AI-powered data analysis |
| GET | `/api/premium/content` | $0.005 | Premium content access |
| POST | `/api/agent/data` | $0.002 | Agent-to-agent data exchange |
| POST | `/api/compute` | $0.05 | Computational service |

## Testing with Client

### Configure Client

Add to your `.env`:

```env
# Your private key for payments (DO NOT COMMIT!)
PRIVATE_KEY=0x...your_private_key_here

# Merchant URL
MERCHANT_URL=http://localhost:4021
```

### Run Client Tests

```bash
npm run dev:client
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

## Supported Networks

- `base-sepolia` - Base Sepolia Testnet
- `base` - Base Mainnet
- `polygon-amoy` - Polygon Amoy Testnet
- `polygon` - Polygon Mainnet
- And more...

## Project Structure

```
.
├── src/
│   ├── index.ts      # Merchant server implementation
│   └── client.ts     # Test client for payments
├── .env.example      # Environment configuration template
├── .env              # Your local configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start merchant server in development mode |
| `npm run dev:client` | Run test client |
| `npm run build` | Build for production |
| `npm start` | Run production build |

## Resources

- [PayAI Documentation](https://docs.payai.network)
- [x402 Protocol Specification](https://www.x402.org)
- [PayAI Facilitator](https://facilitator.payai.network)

## License

ISC
