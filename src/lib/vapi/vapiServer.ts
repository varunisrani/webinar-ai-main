import { VapiClient } from '@vapi-ai/server-sdk'
import jwt from 'jsonwebtoken'
import { Algorithm } from 'jsonwebtoken'

// Define the payload
const payload = {
  orgId: process.env.VAPI_ORG_ID,
  token: {
    // This is the scope of the token
    tag: 'private',
  },
}

// Get the private key from environment variables
const key = process.env.VAPI_PRIVATE_KEY!

if (!key || !process.env.VAPI_ORG_ID) {
  console.error("🔴 VAPI Configuration Error:", {
    hasPrivateKey: !!key,
    hasOrgId: !!process.env.VAPI_ORG_ID,
    privateKeyLength: key?.length,
    timestamp: new Date().toISOString()
  });
  throw new Error("Missing VAPI configuration");
}

// Define token options
const options = {
  expiresIn: 2800, // 1 hour in seconds
  algorithm: 'HS256' as Algorithm
}

let token: string;
try {
  // Generate the token using a JWT library or built-in functionality
  token = jwt.sign(payload, key, options);
  console.log("✅ VAPI JWT Token generated successfully", {
    tokenLength: token?.length || 0,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error("🔴 Failed to generate VAPI JWT token:", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  throw new Error("Failed to initialize VAPI client");
}

let vapiServer: VapiClient;
try {
  console.log("🔄 Initializing VAPI client...");
  vapiServer = new VapiClient({ token });
  console.log("✅ VAPI client initialized successfully");
} catch (error) {
  console.error("🔴 Failed to initialize VAPI client:", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  throw new Error("Failed to initialize VAPI client");
}

export { vapiServer };
