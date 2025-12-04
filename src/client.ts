import "dotenv/config";
import axios from "axios";
import { withPaymentInterceptor, createSigner } from "x402-axios";

// Configuration
const MERCHANT_URL = process.env.MERCHANT_URL || "http://localhost:4021";
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || process.env.PRIVATE_KEY;
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;

if (!EVM_PRIVATE_KEY) {
  console.error("Error: EVM_PRIVATE_KEY (or PRIVATE_KEY) environment variable is required");
  console.error("Please set your EVM wallet private key in .env file");
  process.exit(1);
}

if (!SOLANA_PRIVATE_KEY) {
  console.warn("Warning: SOLANA_PRIVATE_KEY not set. Solana endpoints will not be tested with payment.");
}

// Helper function to decode x-payment-response header
function decodePaymentResponse(header: string | undefined): object | null {
  if (!header) return null;
  try {
    const decoded = Buffer.from(header, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function testMerchant() {
  // Create signers for different networks
  const evmSigner = await createSigner("base-sepolia", EVM_PRIVATE_KEY as `0x${string}`);
  
  // Create Solana signer if valid private key is provided
  let solanaSigner = null;
  if (SOLANA_PRIVATE_KEY && !SOLANA_PRIVATE_KEY.includes("Your")) {
    try {
      solanaSigner = await createSigner("solana", SOLANA_PRIVATE_KEY as `0x${string}`);
    } catch (error: any) {
      console.warn("⚠️  Failed to create Solana signer:", error.message);
      console.warn("   Solana endpoints will be skipped.");
    }
  }

  console.log("🔐 x402 Multi-Facilitator Client");
  console.log(`📍 Merchant URL: ${MERCHANT_URL}`);
  console.log(`🌐 Networks: Base Sepolia (EVM) + Solana`);
  console.log(`💳 EVM Signer: Ready`);
  console.log(`💳 Solana Signer: ${solanaSigner ? "Ready" : "Not configured"}`);
  console.log("");

  // Create axios instances with payment interceptors
  const evmAxios = withPaymentInterceptor(axios.create(), evmSigner);
  const solanaAxios = solanaSigner 
    ? withPaymentInterceptor(axios.create(), solanaSigner)
    : null;

  console.log("=".repeat(60));
  console.log("Testing x402 Multi-Facilitator Merchant Endpoints");
  console.log("=".repeat(60));
  console.log("");

  // ============================================
  // FREE ENDPOINTS
  // ============================================

  // Test 1: Check server health (free endpoint)
  console.log("📋 Test 1: Health Check (free)");
  try {
    const healthResponse = await axios.get(`${MERCHANT_URL}/health`);
    console.log("✅ Health:", JSON.stringify(healthResponse.data, null, 2));
  } catch (error: any) {
    console.error("❌ Health check failed:", error.message);
  }
  console.log("");

  // Test 2: Get server info (free endpoint)
  console.log("📋 Test 2: Server Info (free)");
  try {
    const infoResponse = await axios.get(`${MERCHANT_URL}/`);
    console.log("✅ Server Info:", JSON.stringify(infoResponse.data, null, 2));
  } catch (error: any) {
    console.error("❌ Server info failed:", error.message);
  }
  console.log("");

  // ============================================
  // PAID ENDPOINTS - MULTI-FACILITATOR
  // ============================================

  console.log("-".repeat(60));
  console.log("💳 PAID ENDPOINTS - EVM (Base Sepolia)");
  console.log("-".repeat(60));
  console.log("");

  // Test 3: Weather Data - PayAI Facilitator (Base Sepolia)
  console.log("📋 Test 3: Weather Data (PayAI/Base - $0.001)");
  console.log("   Facilitator: https://facilitator.payai.network");
  try {
    const weatherResponse = await evmAxios.get(`${MERCHANT_URL}/api/weather`);
    console.log("✅ Weather Data:", JSON.stringify(weatherResponse.data, null, 2));
    const paymentInfo = decodePaymentResponse(
      weatherResponse.headers["x-payment-response"] as string | undefined
    );
    if (paymentInfo) {
      console.log("💰 Payment Info:", paymentInfo);
    }
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("⚠️ Payment required. Response:", error.response.data);
    } else {
      console.error("❌ Weather request failed:", error.message);
    }
  }
  console.log("");

  // Test 4: AI Image Generation - Heurist Facilitator (Base Sepolia)
  console.log("📋 Test 4: AI Image Generation (Heurist/Base - $0.02)");
  console.log("   Facilitator: https://facilitator.heurist.xyz");
  try {
    const imageResponse = await evmAxios.post(`${MERCHANT_URL}/api/ai/image`, {
      prompt: "A futuristic city with flying cars at sunset",
      style: "cyberpunk",
      size: "1024x1024",
    });
    console.log("✅ AI Image:", JSON.stringify(imageResponse.data, null, 2));
    const paymentInfo = decodePaymentResponse(
      imageResponse.headers["x-payment-response"] as string | undefined
    );
    if (paymentInfo) {
      console.log("💰 Payment Info:", paymentInfo);
    }
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("⚠️ Payment required. Response:", error.response.data);
    } else {
      console.error("❌ AI Image request failed:", error.message);
    }
  }
  console.log("");

  // Test 5: Agent Task - Daydreams Facilitator (Base Sepolia)
  console.log("📋 Test 5: Agent Task (Daydreams/Base - $0.01)");
  console.log("   Facilitator: https://facilitator.daydreams.systems");
  try {
    const taskResponse = await evmAxios.post(`${MERCHANT_URL}/api/agent/task`, {
      taskType: "analysis",
      instructions: "Analyze the current market trends for AI tokens",
      context: {
        timeframe: "24h",
        focus: ["trading_volume", "price_action", "sentiment"],
      },
    });
    console.log("✅ Agent Task:", JSON.stringify(taskResponse.data, null, 2));
    const paymentInfo = decodePaymentResponse(
      taskResponse.headers["x-payment-response"] as string | undefined
    );
    if (paymentInfo) {
      console.log("💰 Payment Info:", paymentInfo);
    }
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("⚠️ Payment required. Response:", error.response.data);
    } else {
      console.error("❌ Agent Task request failed:", error.message);
    }
  }
  console.log("");

  // ============================================
  // PAID ENDPOINTS - SOLANA
  // ============================================

  console.log("-".repeat(60));
  console.log("💳 PAID ENDPOINTS - Solana");
  console.log("-".repeat(60));
  console.log("");

  // Test 6: Compute Service - Dexter Facilitator (Solana)
  console.log("📋 Test 6: Compute Service (Dexter/Solana - $0.05)");
  console.log("   Facilitator: https://dexter.cash/facilitator");
  
  if (!solanaAxios) {
    console.log("⏭️  Skipping: SOLANA_PRIVATE_KEY not configured");
    console.log("   Add SOLANA_PRIVATE_KEY to .env to test Solana endpoints");
  } else {
    try {
      const computeResponse = await solanaAxios.post(`${MERCHANT_URL}/api/compute`, {
        operation: "matrix_multiplication",
        input: [[1, 2], [3, 4]],
        parameters: {
          precision: "high",
          timeout: 5000,
        },
      });
      console.log("✅ Compute Result:", JSON.stringify(computeResponse.data, null, 2));
      const paymentInfo = decodePaymentResponse(
        computeResponse.headers["x-payment-response"] as string | undefined
      );
      if (paymentInfo) {
        console.log("💰 Payment Info:", paymentInfo);
      }
    } catch (error: any) {
      if (error.response?.status === 402) {
        console.log("⚠️ Payment required. Response:", error.response.data);
      } else {
        console.error("❌ Compute request failed:", error.message);
      }
    }
  }
  console.log("");

  console.log("=".repeat(60));
  console.log("Testing Complete!");
  console.log("=".repeat(60));
  console.log("");
  console.log("Summary:");
  console.log("  EVM (Base Sepolia):");
  console.log("    - PayAI:     GET  /api/weather    - $0.001");
  console.log("    - Heurist:   POST /api/ai/image   - $0.02");
  console.log("    - Daydreams: POST /api/agent/task - $0.01");
  console.log("  Solana:");
  console.log("    - Dexter:    POST /api/compute    - $0.05");
}

// Run tests
testMerchant().catch(console.error);
