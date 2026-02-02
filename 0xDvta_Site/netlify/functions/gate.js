exports.handler = async function(event, context) {
    // 1. Les Headers qui autorisent tout le monde (CORS)
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-payment-token",
        "Content-Type": "application/json"
    };

    // 2. IMPORTANT : Si le scanner demande juste "C'est ouvert ?", on répond OUI (200) sans demander d'argent.
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: headers,
            body: "" // Réponse vide mais positive
        };
    }

    // 3. Le contenu de la réponse 402 (Copie exacte de votre config)
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

    // 4. Pour tout le reste (POST, GET), on demande l'argent (402)
    return {
        statusCode: 402,
        headers: headers,
        body: JSON.stringify(paymentInfo)
    };
};
