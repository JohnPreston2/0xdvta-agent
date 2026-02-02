exports.handler = async function(event, context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: headers, body: "" };
    }

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

    return {
        statusCode: 402,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(paymentInfo)
    };
};
