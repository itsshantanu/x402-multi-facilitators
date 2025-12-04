import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { paymentMiddleware, Network } from "x402-express";

// Validate required environment variables
const PAYAI_FACILITATOR_URL = process.env.PAYAI_FACILITATOR_URL || "https://facilitator.payai.network";
const DEXTER_FACILITATOR_URL = process.env.DEXTER_FACILITATOR_URL || "https://dexter.cash/facilitator";
const HEURIST_FACILITATOR_URL = process.env.HEURIST_FACILITATOR_URL || "https://facilitator.heurist.xyz";
const DAYDREAMS_FACILITATOR_URL = process.env.DAYDREAMS_FACILITATOR_URL || "https://facilitator.daydreams.systems";

// Payment addresses for different networks
const EVM_ADDRESS = process.env.EVM_ADDRESS; // For Base Sepolia (PayAI, Heurist, Daydreams)
const SOLANA_ADDRESS = process.env.SOLANA_ADDRESS; // For Solana (Dexter)

const PORT = process.env.PORT || 4021;

if (!EVM_ADDRESS) {
  console.error("Error: EVM_ADDRESS environment variable is required (for PayAI/Heurist/Base)");
  process.exit(1);
}

if (!SOLANA_ADDRESS) {
  console.error("Error: SOLANA_ADDRESS environment variable is required (for Dexter/Solana)");
  process.exit(1);
}

console.log("🚀 Starting x402 Multi-Facilitator Merchant Server...");
console.log(`\n📍 Facilitators:`);
console.log(`   PayAI (Base Sepolia): ${PAYAI_FACILITATOR_URL}`);
console.log(`   Heurist (Base Sepolia): ${HEURIST_FACILITATOR_URL}`);
console.log(`   Daydreams (Base Sepolia): ${DAYDREAMS_FACILITATOR_URL}`);
console.log(`   Dexter (Solana): ${DEXTER_FACILITATOR_URL}`);
console.log(`\n💰 Payment Addresses:`);
console.log(`   EVM (Base): ${EVM_ADDRESS}`);
console.log(`   Solana: ${SOLANA_ADDRESS}`);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// PayAI Facilitator Routes (Base Sepolia - EVM)
// ============================================
const payaiRoutes = {
  // Weather data endpoint - $0.001 per request
  "GET /api/weather": {
    price: "$0.001",
    network: "base-sepolia" as Network,
    config: {
      description: "Get current weather data (PayAI/Base)",
    },
  },
};

// ============================================
// Dexter Facilitator Routes (Solana)
// ============================================
const dexterRoutes = {
  // Computation service - $0.05 per request
  "POST /api/compute": {
    price: "$0.05",
    network: "solana" as Network,
    config: {
      description: "Computational service (Dexter/Solana)",
    },
  },
};

// ============================================
// Heurist Facilitator Routes (Base Sepolia - EVM)
// ============================================
const heuristRoutes = {
  // AI Image generation endpoint - $0.02 per request
  "POST /api/ai/image": {
    price: "$0.02",
    network: "base-sepolia" as Network,
    config: {
      description: "AI image generation (Heurist/Base)",
    },
  },
};

// ============================================
// Daydreams Facilitator Routes (Base Sepolia - EVM)
// ============================================
const daydreamsRoutes = {
  // Agent task endpoint - $0.01 per request
  "POST /api/agent/task": {
    price: "$0.01",
    network: "base-sepolia" as Network,
    config: {
      description: "Agent task execution (Daydreams/Base)",
    },
  },
};

// Apply PayAI payment middleware (Base Sepolia)
app.use(
  paymentMiddleware(
    EVM_ADDRESS as `0x${string}`,
    payaiRoutes,
    {
      url: PAYAI_FACILITATOR_URL as `${string}://${string}`,
    }
  )
);

// Apply Dexter payment middleware (Solana)
app.use(
  paymentMiddleware(
    SOLANA_ADDRESS as `0x${string}`,
    dexterRoutes,
    {
      url: DEXTER_FACILITATOR_URL as `${string}://${string}`,
    }
  )
);

// Apply Heurist payment middleware (Base Sepolia)
app.use(
  paymentMiddleware(
    EVM_ADDRESS as `0x${string}`,
    heuristRoutes,
    {
      url: HEURIST_FACILITATOR_URL as `${string}://${string}`,
    }
  )
);

// Apply Daydreams payment middleware (Base Sepolia)
app.use(
  paymentMiddleware(
    EVM_ADDRESS as `0x${string}`,
    daydreamsRoutes,
    {
      url: DAYDREAMS_FACILITATOR_URL as `${string}://${string}`,
    }
  )
);

// ============================================
// Public Endpoints (no payment required)
// ============================================

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    facilitators: {
      payai: {
        url: PAYAI_FACILITATOR_URL,
        network: "base-sepolia",
        address: EVM_ADDRESS,
      },
      heurist: {
        url: HEURIST_FACILITATOR_URL,
        network: "base-sepolia",
        address: EVM_ADDRESS,
      },
      daydreams: {
        url: DAYDREAMS_FACILITATOR_URL,
        network: "base-sepolia",
        address: EVM_ADDRESS,
      },
      dexter: {
        url: DEXTER_FACILITATOR_URL,
        network: "solana",
        address: SOLANA_ADDRESS,
      },
    },
  });
});

// Info endpoint - describes available paid services
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "x402 Multi-Facilitator Merchant Agent",
    description: "A merchant server implementing x402 payment protocol with multiple facilitators (PayAI + Heurist + Daydreams + Dexter)",
    facilitators: {
      payai: {
        url: PAYAI_FACILITATOR_URL,
        network: "base-sepolia",
        paymentAddress: EVM_ADDRESS,
      },
      heurist: {
        url: HEURIST_FACILITATOR_URL,
        network: "base-sepolia",
        paymentAddress: EVM_ADDRESS,
      },
      daydreams: {
        url: DAYDREAMS_FACILITATOR_URL,
        network: "base-sepolia",
        paymentAddress: EVM_ADDRESS,
      },
      dexter: {
        url: DEXTER_FACILITATOR_URL,
        network: "solana",
        paymentAddress: SOLANA_ADDRESS,
      },
    },
    endpoints: {
      public: {
        "GET /": "This info page",
        "GET /health": "Health check",
      },
      paid: {
        payai: {
          "GET /api/weather": {
            price: "$0.001",
            network: "base-sepolia",
            description: "Get current weather data",
          },
        },
        heurist: {
          "POST /api/ai/image": {
            price: "$0.02",
            network: "base-sepolia",
            description: "AI image generation",
          },
        },
        daydreams: {
          "POST /api/agent/task": {
            price: "$0.01",
            network: "base-sepolia",
            description: "Agent task execution",
          },
        },
        dexter: {
          "POST /api/compute": {
            price: "$0.05",
            network: "solana",
            description: "Computational service",
          },
        },
      },
    },
    protocol: "x402",
    documentation: "https://docs.payai.network",
  });
});

// ============================================
// Protected Endpoints (payment required)
// ============================================

// Weather data endpoint
app.get("/api/weather", (_req: Request, res: Response) => {
  // Simulated weather data - in production, integrate with a real weather API
  const weatherData = {
    location: "San Francisco, CA",
    temperature: 68,
    temperatureUnit: "F",
    conditions: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    windUnit: "mph",
    forecast: [
      { day: "Today", high: 70, low: 55, conditions: "Partly Cloudy" },
      { day: "Tomorrow", high: 72, low: 57, conditions: "Sunny" },
      { day: "Day After", high: 68, low: 54, conditions: "Foggy" },
    ],
    timestamp: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: weatherData,
    message: "Weather data retrieved successfully",
  });
});

// Computation service endpoint (Dexter/Solana)
app.post("/api/compute", (req: Request, res: Response) => {
  const { operation, input, parameters } = req.body;

  // Simulated computation - in production, run actual computations
  const computeResult = {
    operationId: `op_${Date.now()}`,
    operation: operation || "default_compute",
    input: input,
    parameters: parameters || {},
    result: {
      status: "completed",
      output: {
        computed: true,
        value: Math.random() * 1000,
        precision: 6,
      },
      metrics: {
        cpuTime: "156ms",
        memoryUsed: "24MB",
        gpuUtilization: "45%",
      },
    },
    billingInfo: {
      computeUnits: 1,
      pricePerUnit: "$0.05",
    },
    completedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: computeResult,
    message: "Computation completed successfully",
  });
});

// ============================================
// Heurist AI Endpoints (payment required)
// ============================================

// AI Image generation endpoint
app.post("/api/ai/image", (req: Request, res: Response) => {
  const { prompt, style, size } = req.body;

  // Simulated AI image generation - in production, integrate with Heurist AI
  const imageResult = {
    requestId: `img_${Date.now()}`,
    prompt: prompt || "A beautiful landscape",
    style: style || "realistic",
    size: size || "1024x1024",
    imageUrl: `https://placeholder.heurist.ai/generated/${Date.now()}.png`,
    metadata: {
      model: "heurist-diffusion-v1",
      steps: 50,
      guidance: 7.5,
      seed: Math.floor(Math.random() * 1000000),
    },
    generatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: imageResult,
    message: "Image generated successfully",
  });
});

// ============================================
// Daydreams Agent Endpoint (payment required)
// ============================================

// Agent task execution endpoint
app.post("/api/agent/task", (req: Request, res: Response) => {
  const { taskType, instructions, context } = req.body;

  // Simulated agent task execution - in production, integrate with Daydreams
  const taskResult = {
    taskId: `task_${Date.now()}`,
    taskType: taskType || "general",
    instructions: instructions || "Execute default task",
    context: context || {},
    result: {
      status: "completed",
      output: {
        response: "Task executed successfully by Daydreams agent",
        actions: ["analyzed_input", "processed_request", "generated_response"],
        confidence: 0.92,
      },
      metadata: {
        agentVersion: "daydreams-v1",
        executionTime: "234ms",
        tokensUsed: 150,
      },
    },
    completedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: taskResult,
    message: "Agent task completed successfully",
  });
});

// ============================================
// Error handling
// ============================================

app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

// ============================================
// Start server
// ============================================

app.listen(PORT, () => {
  console.log(`\n✅ x402 Multi-Facilitator Merchant Server is running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   Public:`);
  console.log(`   - GET  /              - Server info`);
  console.log(`   - GET  /health        - Health check`);
  console.log(`\n   Paid:`);
  console.log(`   - GET  /api/weather     - $0.001 - Weather (PayAI/Base)`);
  console.log(`   - POST /api/ai/image    - $0.02  - AI image (Heurist/Base)`);
  console.log(`   - POST /api/agent/task  - $0.01  - Agent task (Daydreams/Base)`);
  console.log(`   - POST /api/compute     - $0.05  - Compute (Dexter/Solana)`);
  console.log(`\n🔐 Facilitators:`);
  console.log(`   - PayAI:     ${PAYAI_FACILITATOR_URL}`);
  console.log(`   - Heurist:   ${HEURIST_FACILITATOR_URL}`);
  console.log(`   - Daydreams: ${DAYDREAMS_FACILITATOR_URL}`);
  console.log(`   - Dexter:    ${DEXTER_FACILITATOR_URL}`);
});
