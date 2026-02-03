// netlify/functions/analyze.js
// Cette fonction retourne une vraie réponse HTTP 402 pour X402scan

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, PAYMENT-SIGNATURE, PAYMENT-RESPONSE',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Check if payment is provided
  const paymentSignature = event.headers['payment-signature'];
  
  if (!paymentSignature) {
    // No payment - return 402 Payment Required
    
    const x402Response = {
      x402Version: 2,
      error: "Payment required",
      accepts: [
        {
          scheme: "exact",
          network: "eip155:8453",  // Base mainnet
          amount: "500000",  // $0.50 in USDC (6 decimals)
          payTo: "0x71fd4359eB2da83C1BCd34f93a1C206d68b1eFba",
          maxTimeoutSeconds: 300,
          asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",  // USDC on Base
          extra: {
            description: "0xDvta Solana Token Forensic Analysis",
            provider: "0xDvta Forensic Unit"
          }
        }
      ],
      resource: {
        url: "https://0xdvta-agent.netlify.app/.netlify/functions/analyze",
        description: "Deep forensic analysis of Solana tokens including on-chain scan, technical audit, money flow tracking, and sniper watch",
        mimeType: "application/json"
      },
      extensions: {
        bazaar: {
          info: {
            input: {
              tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              analysisDepth: "deep",
              includeHolders: true
            },
            output: {
              success: true,
              tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              riskScore: 65,
              analysis: {
                onChainScan: { status: "completed" },
                technicalAudit: { status: "completed" },
                moneyFlow: { status: "completed" },
                sniperWatch: { status: "completed" }
              }
            }
          },
          schema: {
            input: {
              type: "object",
              properties: {
                tokenAddress: {
                  type: "string",
                  description: "Solana token address (base58 format)"
                },
                analysisDepth: {
                  type: "string",
                  enum: ["basic", "deep", "technical", "flow", "sniper", "complete"],
                  description: "Level of forensic analysis"
                },
                includeHolders: {
                  type: "boolean",
                  description: "Include holder distribution analysis"
                }
              },
              required: ["tokenAddress"]
            },
            output: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                tokenAddress: { type: "string" },
                riskScore: { type: "number" },
                analysis: { type: "object" }
              }
            }
          }
        }
      }
    };

    // Add PAYMENT-REQUIRED header (V2 format)
    headers['PAYMENT-REQUIRED'] = JSON.stringify(x402Response.accepts[0]);

    return {
      statusCode: 402,
      headers,
      body: JSON.stringify(x402Response)
    };
  }

  // Payment provided - process the request
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { tokenAddress, analysisDepth = "deep", includeHolders = true } = requestBody;

    if (!tokenAddress) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required parameter: tokenAddress"
        })
      };
    }

    // TODO: Verify payment signature here
    // For now, we'll simulate the analysis

    // Simulate analysis (remplace par ton vrai code)
    const analysis = {
      success: true,
      tokenAddress,
      analysisDepth,
      timestamp: new Date().toISOString(),
      riskScore: Math.floor(Math.random() * 100),
      analysis: {
        onChainScan: {
          status: "completed",
          findings: ["Contract verified", "Liquidity locked", "No mint authority"],
          liquidityUSD: 1250000,
          holders: 15420
        },
        technicalAudit: {
          status: "completed",
          vulnerabilities: [],
          securityScore: 85
        },
        moneyFlow: {
          status: analysisDepth === "flow" || analysisDepth === "complete" ? "completed" : "not_requested",
          largestTransfers: []
        },
        sniperWatch: {
          status: analysisDepth === "sniper" || analysisDepth === "complete" ? "completed" : "not_requested",
          suspiciousWallets: []
        },
        holderDistribution: includeHolders ? {
          top10Concentration: "32%",
          totalHolders: 15420
        } : null
      },
      recommendations: [
        "Monitor liquidity pool movements",
        "Watch for large wallet accumulation"
      ]
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysis)
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Analysis failed",
        message: error.message
      })
    };
  }
};
