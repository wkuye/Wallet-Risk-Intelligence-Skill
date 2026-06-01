# Pharos Wallet Analyzer Skill

> A Pharos Agent Center Skill that analyzes any wallet on the Pharos network —
> balance, activity, reputation score, risk signals, and wallet age.
> No API key required. MIT-0 licensed.

---

## What It Does

Given a wallet address, this skill queries the **Pharos public RPC** and returns:

| Field            | Description                                              |
|------------------|----------------------------------------------------------|
| `balance`        | Native PHAR balance (human-readable)                     |
| `score`          | Behavioral score 0–100                                   |
| `reputation`     | Unknown / Unverified / Minimal / Sparse / Developing / Active / Established |
| `riskSignals`    | List of flagged concerns (bot, low history, etc.)        |
| `metrics.txCount`| Total transactions (from nonce)                          |
| `metrics.activityLevel` | Low / Medium / High                              |
| `metrics.longevity`     | New / Mid-term / Long-term / Unknown             |
| `scoreBreakdown` | Detailed score by category                               |

---

## Quick Start

```bash
# Install dependencies
npm install

# Analyze a wallet
npx ts-node --esm src/index.ts 0xfaC0718D882E5f07e1972D617bd430CD72A55D84
```

### Example Output

```json
{
  "wallet": "0xfaC0718D882E5f07e1972D617bd430CD72A55D84",
  "balance": "4.250000 PHAR",
  "score": 67,
  "reputation": "Active",
  "summary": "This wallet is reasonably active on Pharos with a solid transaction history and a recognizable usage pattern.",
  "riskSignals": [],
  "metrics": {
    "txCount": 312,
    "activityLevel": "Medium",
    "longevity": "Long-term"
  },
  "scoreBreakdown": {
    "activityScore": 22,
    "balanceScore": 20,
    "consistencyScore": 15,
    "longevityScore": 10
  }
}
```

---

## Using with Claude Code

Add to your Claude Code session:

```
Use the pharos_wallet_analyzer tool to analyze 0xfaC0718D882E5f07e1972D617bd430CD72A55D84
```

Or prompt naturally:

```
Analyze the Pharos wallet 0xfaC0718D882E5f07e1972D617bd430CD72A55D84 and tell me if it's trustworthy
```

---

## Project Structure

```text
pharos-wallet-reputation/
│
├── src/
│   ├── index.ts                # CLI entrypoint + agent tool export
│   └── services/
│       ├── walletAnalyzer.ts.  # Main orchestration logic
│       ├── pharos.ts.          # Pharos RPC client (eth_getBalance, eth_getTransactionCount, eth_getLogs)
│       ├── scorer.ts.          # Deterministic 0–100 behavioral score
│       └── explainer.ts.       # Score → reputation label + human summary
│
├── package.json
├── tsconfig.json
└── README.md
```



### Scoring Breakdown

| Category      | Max | How it's calculated                          |
|---------------|-----|----------------------------------------------|
| Activity      | 30  | Based on nonce (tx count)                    |
| Balance       | 25  | Native PHAR balance tiers                    |
| Consistency   | 25  | Send/receive ratio diversity                 |
| Longevity     | 20  | Age of oldest transaction in scanned window  |

---

## Network Details

| Property  | Value                        |
|-----------|------------------------------|
| Network   | Pharos Mainnet               |
| RPC       | `https://rpc.pharos.xyz`     |
| Chain ID  | `0x688` (1672)               |
| API Key   | Not required                 |

---

## Supported Frameworks

- **Claude Code** (primary)
- OpenClaw
- Codex
- Any Node.js / TypeScript agent framework

---

## Dependencies

- Node.js >= 18 (native `fetch` built-in)
- TypeScript >= 5
- `ts-node` (dev only)
- No runtime npm packages required

---

## License

MIT-0 — Free to use, modify, and redistribute. No attribution required.
