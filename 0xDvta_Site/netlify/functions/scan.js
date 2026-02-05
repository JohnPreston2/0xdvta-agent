// netlify/functions/scan.js
const { ethers } = require('ethers');

// Configuration
const USDC_CONTRACT_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RECIPIENT_BASE = '0x71fd4359eB2da83C1BCd34f93a1C206d68b1eFba';
const RECIPIENT_SOLANA = 'nzEeqCR7ZnjoZU31fgUoLfP7FEMqj968zN4UBSQyXLP';
const REQUIRED_AMOUNT = 0.30; // $0.30 USDC

// RPC Provider Base
const baseProvider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');

// Cache simple des paiements utilisés (en prod, utilise une DB)
// Note: En Netlify Functions, ceci se reset à chaque redémarrage
// Pour une vraie prod, utilise Upstash Redis ou une DB
const usedPayments = new Set();

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Payment-Signature, X-Payment-Chain',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only POST allowed
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { tokenAddress } = body;
        const paymentSignature = event.headers['x-payment-signature'];
        const paymentChain = event.headers['x-payment-chain'];

        console.log('=== SCAN REQUEST ===');
        console.log('Token:', tokenAddress);
        console.log('Payment sig:', paymentSignature);
        console.log('Chain:', paymentChain);

        // Validation token address
        if (!tokenAddress) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Token address required' })
            };
        }

        // Si pas de paiement, demander un paiement
        if (!paymentSignature) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({
                    error: 'Payment required',
                    amount: REQUIRED_AMOUNT,
                    chains: ['base', 'solana'],
                    message: 'Please send payment to proceed'
                })
            };
        }

        // Vérifier si déjà utilisé
        if (usedPayments.has(paymentSignature)) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({
                    error: 'Payment already used',
                    message: 'This transaction has already been processed'
                })
            };
        }

        // Vérifier le paiement
        let isValid = false;

        if (paymentChain === 'base') {
            console.log('Verifying Base payment...');
            isValid = await verifyBasePayment(paymentSignature);
        } else if (paymentChain === 'solana') {
            console.log('Verifying Solana payment...');
            // TODO: Implémenter la vérification Solana
            // Pour l'instant, on accepte
            isValid = true;
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid payment chain' })
            };
        }

        if (!isValid) {
            console.error('Payment verification failed');
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({
                    error: 'Invalid payment',
                    message: 'Payment verification failed. Please check the transaction.'
                })
            };
        }

        console.log('✅ Payment verified');

        // Marquer comme utilisé
        usedPayments.add(paymentSignature);

        // === FAIRE LE SCAN ICI ===
        // TODO: Appeler ton vrai service de scan (x402, etc.)
        const scanResults = await performTokenScan(tokenAddress);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(scanResults)
        };

    } catch (error) {
        console.error('Scan error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

// === VÉRIFICATION PAIEMENT BASE ===
async function verifyBasePayment(txHash) {
    try {
        console.log('Fetching transaction:', txHash);

        // Récupérer le receipt
        const receipt = await baseProvider.getTransactionReceipt(txHash);

        if (!receipt) {
            console.error('Transaction not found');
            return false;
        }

        // Vérifier que la tx est confirmée
        if (!receipt.status) {
            console.error('Transaction failed on-chain');
            return false;
        }

        // Récupérer les détails
        const tx = await baseProvider.getTransaction(txHash);

        // Vérifier le contrat USDC
        if (tx.to.toLowerCase() !== USDC_CONTRACT_BASE.toLowerCase()) {
            console.error('Wrong contract. Expected:', USDC_CONTRACT_BASE, 'Got:', tx.to);
            return false;
        }

        // Décoder la fonction transfer
        const iface = new ethers.utils.Interface([
            'function transfer(address to, uint256 amount) returns (bool)'
        ]);

        const decoded = iface.parseTransaction({ data: tx.data });

        // Vérifier le destinataire
        if (decoded.args.to.toLowerCase() !== RECIPIENT_BASE.toLowerCase()) {
            console.error('Wrong recipient. Expected:', RECIPIENT_BASE, 'Got:', decoded.args.to);
            return false;
        }

        // Vérifier le montant
        const amountUSDC = parseFloat(ethers.utils.formatUnits(decoded.args.amount, 6));
        
        console.log('Amount received:', amountUSDC, 'USDC');
        console.log('Required:', REQUIRED_AMOUNT, 'USDC');

        if (amountUSDC < REQUIRED_AMOUNT) {
            console.error('Insufficient amount');
            return false;
        }

        console.log('✅ All checks passed');
        return true;

    } catch (error) {
        console.error('Verification error:', error);
        return false;
    }
}

// === FONCTION DE SCAN (PLACEHOLDER) ===
async function performTokenScan(tokenAddress) {
    // TODO: Intégrer avec ton vrai backend x402
    // Pour l'instant, retour mock data
    
    console.log('Performing scan for:', tokenAddress);

    // Simuler un scan
    return {
        tokenAddress: tokenAddress,
        scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        summary: {
            liquidity: Math.floor(Math.random() * 1000000),
            holders: Math.floor(Math.random() * 10000),
            totalApiCalls: 11,
            riskScore: Math.floor(Math.random() * 100)
        },
        downloadUrl: `/downloads/${tokenAddress}.json`,
        status: 'completed'
    };
}
