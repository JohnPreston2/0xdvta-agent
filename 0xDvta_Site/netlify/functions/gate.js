exports.handler = async function(event, context) {
    // 1. Définir le contenu de la réponse 402 (Copie de votre 402.json)
    const paymentInfo = {
        error: { message: "Payment Required", type: "payment_required" },
        accepts: [
            {
                scheme: "item-transfer",
                network: "solana",
                amount: "0.30",
                currency: "USDC",
                beneficiary: "nzEeqCR7ZnjoZU31fgUoLfP7FEMqj968zN4UBSQyXLP",
                chain: "solana"
            }
        ]
    };

    // 2. Renvoyer la réponse avec les bons Headers (CORS + JSON)
    return {
        statusCode: 402,
        headers: {
            "Access-Control-Allow-Origin": "*", // Autorise x402scan
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentInfo)
    };
};