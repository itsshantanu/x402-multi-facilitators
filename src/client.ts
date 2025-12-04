import "dotenv/config";
import axios from "axios";
import { withPaymentInterceptor, createSigner } from "x402-axios";

// Configuration
const MERCHANT_URL = process.env.MERCHANT_URL || "http://localhost:4021";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NETWORK = process.env.NETWORK || "base-sepolia";

if (!PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY environment variable is required");
  console.error("Please set your wallet private key in .env file");
  process.exit(1);
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
  // Create a signer from the private key
  const signer = await createSigner(NETWORK, PRIVATE_KEY as `0x${string}`);

  console.log("🔐 x402 Client Agent");
  console.log(`📍 Merchant URL: ${MERCHANT_URL}`);
  console.log(`🌐 Network: ${NETWORK}`);
  console.log("");

  // Wrap axios with x402 payment capabilities
  const x402Axios = withPaymentInterceptor(axios.create(), signer);

  console.log("=".repeat(50));
  console.log("Testing x402 Merchant Endpoints");
  console.log("=".repeat(50));
  console.log("");

  // Test 1: Check server health (free endpoint)
  console.log("📋 Test 1: Health Check (free)");
  try {
    const healthResponse = await axios.get(`${MERCHANT_URL}/health`);
    console.log("✅ Health:", healthResponse.data);
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

  // Test 3: Access weather data (paid endpoint - $0.001)
  console.log("📋 Test 3: Weather Data (paid - $0.001)");
  try {
    const weatherResponse = await x402Axios.get(`${MERCHANT_URL}/api/weather`);
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

  // Test 4: AI Analysis (paid endpoint - $0.01)
  console.log("📋 Test 4: AI Analysis (paid - $0.01)");
  try {
    const analysisResponse = await x402Axios.get(
      `${MERCHANT_URL}/api/analyze?q=blockchain+trends+2024`
    );
    console.log("✅ Analysis:", JSON.stringify(analysisResponse.data, null, 2));
    const paymentInfo = decodePaymentResponse(
      analysisResponse.headers["x-payment-response"] as string | undefined
    );
    if (paymentInfo) {
      console.log("💰 Payment Info:", paymentInfo);
    }
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("⚠️ Payment required. Response:", error.response.data);
    } else {
      console.error("❌ Analysis request failed:", error.message);
    }
  }
  console.log("");

  // Test 5: Premium Content (paid endpoint - $0.005)
  console.log("📋 Test 5: Premium Content (paid - $0.005)");
  try {
    const premiumResponse = await x402Axios.get(
      `${MERCHANT_URL}/api/premium/content`
    );
    console.log("✅ Premium Content:", JSON.stringify(premiumResponse.data, null, 2));
    const paymentInfo = decodePaymentResponse(
      premiumResponse.headers["x-payment-response"] as string | undefined
    );
    if (paymentInfo) {
      console.log("💰 Payment Info:", paymentInfo);
    }
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("⚠️ Payment required. Response:", error.response.data);
    } else {
      console.error("❌ Premium content request failed:", error.message);
    }
  }
  console.log("");

  // Test 6: Agent Data Exchange (paid endpoint - $0.002)
  console.log("📋 Test 6: Agent Data Exchange (paid - $0.002)");
  try {
    const agentResponse = await x402Axios.post(`${MERCHANT_URL}/api/agent/data`, {
      agentId: "client-agent-001",
      requestType: "data_sync",
      payload: {
        action: "sync_state",
        data: { key: "value" },
      },
    });
    console.log("✅ Agent Data:", JSON.stringify(agentResponse.data, null, 2));
    const paymentInfo = decodePaymentResponse(
      agentResponse.headers["x-payment-response"] as string | undefined
    );
    if (paymentInfo) {
      console.log("💰 Payment Info:", paymentInfo);
    }
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("⚠️ Payment required. Response:", error.response.data);
    } else {
      console.error("❌ Agent data request failed:", error.message);
    }
  }
  console.log("");

  // Test 7: Compute Service (paid endpoint - $0.05)
  console.log("📋 Test 7: Compute Service (paid - $0.05)");
  try {
    const computeResponse = await x402Axios.post(`${MERCHANT_URL}/api/compute`, {
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
  console.log("");

  console.log("=".repeat(50));
  console.log("Testing Complete!");
  console.log("=".repeat(50));
}

// Run tests
testMerchant().catch(console.error);
