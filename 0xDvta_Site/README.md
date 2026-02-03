# 0xDvta Agent - X402 Integration

Agent d'analyse forensique pour tokens Solana avec intégration du protocole de paiement X402.

## 🚀 Déploiement rapide

### Option 1: Site statique sur Netlify (le plus simple)

1. **Modifier l'adresse de paiement** dans `well-known-x402.json`:
   ```json
   "payTo": "0xVOTRE_ADRESSE_ETHEREUM"
   ```

2. **Uploader ces fichiers sur Netlify**:
   - `index.html`
   - `well-known-x402.json`
   - `_redirects`
   - `netlify.toml`
   - `logo.png` (si vous en avez un)

3. **Déployer**: Glissez-déposez dans Netlify ou connectez votre repo GitHub

### Option 2: Serveur Node.js complet (recommandé pour production)

1. **Configurer les variables d'environnement**:
   ```bash
   cp .env.example .env
   # Éditer .env avec vos vraies valeurs
   ```

2. **Installer les dépendances**:
   ```bash
   npm install
   ```

3. **Lancer le serveur**:
   ```bash
   npm start
   ```

4. **Déployer sur Netlify Functions ou Vercel**:
   - Netlify: `netlify deploy --prod`
   - Vercel: `vercel --prod`

## 📋 Configuration requise

### Adresse de wallet
Vous avez besoin d'une adresse Ethereum/Base pour recevoir les paiements USDC:
- **Testnet**: Base Sepolia (pour tester)
- **Mainnet**: Base Mainnet (pour production)

### Variables d'environnement (.env)
```env
X402_WALLET_ADDRESS=0xVOTRE_ADRESSE
X402_NETWORK=eip155:8453
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
PORT=3000
```

## 🔍 Vérifier l'intégration

### 1. Tester l'endpoint de découverte
```bash
curl https://0xdvta-agent.netlify.app/.well-known/x402.json
```

Devrait retourner:
```json
{
  "POST /api/analyze": {
    "accepts": [...],
    "description": "...",
    ...
  }
}
```

### 2. Tester une requête sans paiement
```bash
curl -X POST https://0xdvta-agent.netlify.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}'
```

Devrait retourner **HTTP 402 Payment Required** avec les détails de paiement dans les headers.

### 3. S'enregistrer sur x402scan
Une fois déployé, votre service sera automatiquement découvrable via:
```
https://x402scan.com
```

## 🛠️ Structure du projet

```
.
├── index.html              # Interface web
├── server.js               # Serveur Express avec X402
├── package.json            # Dépendances Node.js
├── well-known-x402.json    # Configuration X402 statique
├── netlify.toml            # Config Netlify
├── _redirects              # Redirections Netlify
└── .env.example            # Template variables d'env
```

## 📚 Endpoints disponibles

### `GET /.well-known/x402.json`
Endpoint de découverte X402 - retourne la configuration des services payants

### `POST /api/analyze`
**Prix**: $0.50 (USDC sur Base)

Analyse forensique d'un token Solana.

**Paramètres**:
```json
{
  "tokenAddress": "string (required)",
  "analysisDepth": "basic|deep|technical|flow|sniper (optional)",
  "includeHolders": "boolean (optional)"
}
```

**Réponse**:
```json
{
  "success": true,
  "tokenAddress": "...",
  "riskScore": 65,
  "analysis": {
    "onChainScan": {...},
    "technicalAudit": {...},
    "moneyFlow": {...},
    "sniperWatch": {...}
  }
}
```

### `GET /api/health`
**Prix**: Gratuit

Health check du service.

## 🔐 Sécurité X402

Le protocole X402 utilise:
- **EIP-3009**: Transferts sans gas pour USDC
- **CAIP-2**: Identifiants de réseau standardisés
- **Facilitateurs**: Coinbase CDP vérifie et règle les paiements on-chain

Avantages:
- ✅ Pas de clés API à gérer
- ✅ Paiements instantanés on-chain
- ✅ Pas de compte utilisateur requis
- ✅ Frais quasi-nuls sur Layer 2 (Base)

## 🧪 Tester sur Testnet

1. **Obtenez du USDC sur Base Sepolia**:
   - https://faucet.circle.com/
   - Network: Base Sepolia

2. **Changez le network dans `.env`**:
   ```env
   X402_NETWORK=eip155:84532
   ```

3. **Utilisez l'URL du facilitateur testnet**:
   ```env
   X402_FACILITATOR_URL=https://x402.org/facilitator
   ```

## 📖 Ressources X402

- Documentation officielle: https://x402.gitbook.io/x402
- GitHub: https://github.com/Merit-Systems/x402scan
- Coinbase CDP: https://docs.cdp.coinbase.com/x402/welcome
- x402scan: https://x402scan.com

## 🐛 Troubleshooting

### Erreur: `[object Object]` dans l'URL
❌ **Cause**: Vous envoyez un objet JS au lieu d'une string
✅ **Solution**: Utilisez `JSON.stringify()` ou retournez des strings

### Erreur: 401 Unauthorized
❌ **Cause**: Adresse de wallet incorrecte ou network mal configuré
✅ **Solution**: Vérifiez `X402_WALLET_ADDRESS` et `X402_NETWORK`

### Service non découvert sur x402scan
❌ **Cause**: Extension bazaar pas activée ou endpoint non accessible
✅ **Solution**: 
1. Vérifiez que `discoverable: true` est dans la config
2. Testez `curl https://votre-url/.well-known/x402.json`
3. Attendez quelques minutes pour l'indexation

## 💡 Améliorations futures

- [ ] Support Solana SPL tokens en plus de Base/ETH
- [ ] Rate limiting par wallet
- [ ] Cache pour les analyses récentes
- [ ] Webhooks pour notifications de paiement
- [ ] Dashboard d'analytics des paiements

## 📞 Support

Pour toute question sur X402:
- Discord: https://discord.gg/coinbase
- GitHub Issues: https://github.com/Merit-Systems/x402scan/issues

---

**Fait avec ❤️ par 0xDvta | Powered by X402 Protocol**
