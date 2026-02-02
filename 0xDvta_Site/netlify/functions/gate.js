exports.handler = async function(event, context) {
    // Headers CORS permissifs pour que x402scan ne soit jamais bloqué
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    };

    // 1. Gérer la pré-vérification (OPTIONS) - CRUCIAL
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: headers, body: "" };
    }

    // 2. Le contenu du paiement (JSON)
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

    // 3. Répondre 402 quoiqu'il arrive
    return {
        statusCode: 402,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(paymentInfo)
    };
};
