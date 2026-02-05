// netlify/functions/analyze.js
const { ethers } = require('ethers');

const USDC_CONTRACT_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RECIPIENT_BASE = '0x71fd4359eB2da83C1BCd34f93a1C206d68b1eFba';

const PRICING = {
    onchain: 0.20,
    complete: 0.50
};

const baseProvider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
const usedPayments = new Set();

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Payment-Signature, X-Payment-Chain',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { scanId, analysisTypes } = body;
        const paymentSignature = event.headers['x-payment-signature'];
        const paymentChain = event.headers['x-payment-chain'];

        console.log('=== ANALYZE REQUEST ===');
        console.log('Scan ID:', scanId);
        console.log('Types:', analysisTypes);
        console.log('Payment:', paymentSignature);

        if (!scanId || !analysisTypes || analysisTypes.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'scanId and analysisTypes required' })
            };
        }

        // Calculer le montant requis
        let requiredAmount = 0;
        analysisTypes.forEach(type => {
            requiredAmount += PRICING[type] || 0;
        });

        console.log('Required amount:', requiredAmount);

        if (!paymentSignature) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({
                    error: 'Payment required',
                    amount: requiredAmount
                })
            };
        }

        if (usedPayments.has(paymentSignature)) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({ error: 'Payment already used' })
            };
        }

        // Vérifier le paiement
        let isValid = false;

        if (paymentChain === 'base') {
            isValid = await verifyBasePayment(paymentSignature, requiredAmount);
        } else if (paymentChain === 'solana') {
            // TODO: Implémenter Solana
            isValid = true;
        }

        if (!isValid) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({ error: 'Invalid payment' })
            };
        }

        usedPayments.add(paymentSignature);

        // === FAIRE L'ANALYSE ===
        const results = await performAnalysis(scanId, analysisTypes);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(results)
        };

    } catch (error) {
        console.error('Analysis error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function verifyBasePayment(txHash, requiredAmount) {
    try {
        const receipt = await baseProvider.getTransactionReceipt(txHash);
        if (!receipt || !receipt.status) return false;

        const tx = await baseProvider.getTransaction(txHash);
        if (tx.to.toLowerCase() !== USDC_CONTRACT_BASE.toLowerCase()) return false;

        const iface = new ethers.utils.Interface([
            'function transfer(address to, uint256 amount) returns (bool)'
        ]);

        const decoded = iface.parseTransaction({ data: tx.data });
        if (decoded.args.to.toLowerCase() !== RECIPIENT_BASE.toLowerCase()) return false;

        const amount = parseFloat(ethers.utils.formatUnits(decoded.args.amount, 6));
        
        return amount >= requiredAmount;

    } catch (error) {
        console.error('Verification error:', error);
        return false;
    }
}

async function performAnalysis(scanId, analysisTypes) {
    // TODO: Intégrer avec ton vrai service d'analyse
    console.log('Performing analysis:', analysisTypes);

    return {
        scanId: scanId,
        analysisTypes: analysisTypes,
        timestamp: new Date().toISOString(),
        results: {
            onchain: analysisTypes.includes('onchain') ? {
                holders: Math.floor(Math.random() * 10000),
                liquidityPools: Math.floor(Math.random() * 10),
                topHolders: []
            } : null,
            complete: analysisTypes.includes('complete') ? {
                fullReport: true,
                score: Math.floor(Math.random() * 100)
            } : null
        },
        downloadUrl: `/downloads/${scanId}_analysis.json`,
        status: 'completed'
    };
}
