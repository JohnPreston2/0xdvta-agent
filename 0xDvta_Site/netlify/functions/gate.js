exports.handler = async function(event, context) {
    // 1. Headers universels (pour éviter les erreurs CORS)
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json"
    };

    // 2. Si le scanner demande juste si on est ouvert (OPTIONS), on dit OUI immédiatement
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: headers, body: "" };
    }

    // 3. L'objet de paiement (Données pures)
    const paymentData = {
        error: { 
            message: "Payment Required", 
            type: "payment_required" 
        },
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

    // 4. Réponse Finale : On transforme l'objet en TEXTE (JSON.stringify)
    return {
        statusCode: 402,
        headers: headers,
        body: JSON.stringify(paymentData)
    };
};
