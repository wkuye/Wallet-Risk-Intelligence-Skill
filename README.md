# Wallet Risk Intelligence Skill

AI-powered wallet reputation and risk assessment Skill for autonomous onchain agents.

This Skill analyzes Ethereum wallet behavior using onchain transaction history and generates structured intelligence including reputation scores, risk signals, bot-risk indicators, and agent-friendly recommendations.

---

## Overview

Wallet Risk Intelligence Skill acts as a trust layer for AI agents operating onchain.

Instead of forcing agents to interpret raw blockchain transactions, this Skill converts wallet activity into behavioral intelligence that can be used to make safer autonomous decisions.

The Skill evaluates:

- Wallet activity level
- Transaction history
- Wallet longevity
- Behavioral consistency
- Bot-like activity patterns
- Overall reputation score
- Agent recommendations

---

## AI Agent Use Cases

This Skill can be used by autonomous agents before executing onchain actions.

Examples:

- Verify wallet trustworthiness before sending funds
- Assess counterparty risk before OTC transactions
- Detect suspicious automation patterns
- Prioritize trusted wallets in agent-to-agent interactions
- Reduce risk in autonomous payment flows
- Evaluate wallets before granting protocol access

By transforming raw blockchain activity into structured behavioral intelligence, AI agents can make safer decisions onchain.

---

## Features

### Wallet Intelligence

- Transaction history analysis
- Activity classification
- Wallet age estimation
- Behavioral assessment

### Risk Engine

- Low activity detection
- Behavioral inconsistency detection
- Reputation scoring
- Risk signal generation

### Bot Detection

- High-frequency transaction detection
- Rapid activity burst detection
- Contract interaction diversity analysis
- Automation risk scoring

### AI Explanation Layer

- Human-readable summaries
- Context-aware behavioral insights
- Explainable reputation assessment

---

## Example Output

```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "score": 82,
  "reputation": "Trusted",
  "recommendation": "SAFE_TO_INTERACT",
  "summary": "This wallet has maintained consistent onchain activity over multiple years and interacts with a diverse set of contracts. No significant behavioral anomalies were detected, resulting in a strong trust assessment.",
  "riskSignals": [],
  "metrics": {
    "txCount": 1200,
    "activityLevel": "High",
    "longevity": "Long-term"
  },
  "botRisk": {
    "score": 18,
    "isLikely": false,
    "reasons": []
  },
  "meta": {
    "scoreContext": "Strong onchain reliability"
  }
}
```

---

## Reputation System

| Score Range | Reputation |
|------------|------------|
| 80 - 100 | Trusted |
| 60 - 79 | Normal |
| 40 - 59 | Risky |
| Below 40 | High Risk |

---

## Agent Recommendations

| Recommendation | Meaning |
|---------------|---------|
| SAFE_TO_INTERACT | Wallet appears trustworthy |
| PROCEED_WITH_CAUTION | Some risk indicators present |
| REVIEW_REQUIRED | Significant behavioral concerns |
| INSUFFICIENT_DATA | Not enough activity to assess |

---

## Project Structure

```text
pharos-wallet-reputation/
│
├── src/
│   ├── index.ts
│   └── services/
│       ├── walletAnalyzer.ts
│       ├── etherscan.ts
│       ├── scorer.ts
│       └── explainer.ts
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/pharos-wallet-reputation.git
cd pharos-wallet-reputation
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
RPC_URL=RPC_URL=https://eth.llamarpc.com
ETHERSCAN_API_KEY=your_api_key_here
```

Get an API key from Etherscan.

---

## Usage

Run the Skill:

```bash
npm run start <wallet_address>
```

Example:

```bash
npm run start 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

The Skill returns:

- Reputation score
- Reputation classification
- AI-generated explanation
- Risk signals
- Bot-risk analysis
- Behavioral metrics
- Agent recommendation

---

## Supported Framework

- Node.js
- TypeScript

---

## Dependencies

- Axios
- dotenv
- Ethers.js

---

## Why This Skill Matters

AI agents require trust and safety mechanisms before interacting with wallets autonomously.

Wallet Risk Intelligence Skill provides a lightweight behavioral analysis layer that helps agents:

- Reduce interaction risk
- Detect suspicious activity
- Assess trustworthiness
- Make informed onchain decisions

This enables safer and more intelligent agent-to-agent and agent-to-user interactions within decentralized ecosystems.

---

## Future Improvements

- Multi-chain support
- DeFi protocol reputation scoring
- Contract risk analysis
- Wallet clustering detection
- AI-powered natural language explanations
- Historical reputation tracking

---

## License

MIT License

---

Built for the Pharos Agent Center Skill Builder Campaign 🚀