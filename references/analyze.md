# Wallet Analyzer Reference

## Setup

Read network config before every operation:

```bash
RPC_URL=$(jq -r '.networks[] | select(.name=="atlantic-testnet") | .rpcUrl' assets/networks.json)
EXPLORER=$(jq -r '.networks[] | select(.name=="atlantic-testnet") | .explorerUrl' assets/networks.json)
```

---

## Full Wallet Analysis

Run all steps below in sequence for a complete wallet report.
Print a structured summary at the end (see Sample Output).

**Agent steps:**
1. Validate address format (0x + 40 hex chars)
2. Run native balance query
3. Run transaction count query
4. Run token holdings queries
5. Compute score, reputation, and risk signals from results
6. Print formatted report

---

## Native Balance

```bash
ADDRESS=<wallet_address>
RPC_URL=$(jq -r '.networks[] | select(.name=="atlantic-testnet") | .rpcUrl' assets/networks.json)

cast balance $ADDRESS --rpc-url $RPC_URL --ether
```

**Output**: Balance in PHRS (ether units).

---

## Transaction Count (Nonce = Activity Proxy)

```bash
ADDRESS=<wallet_address>
RPC_URL=$(jq -r '.networks[] | select(.name=="atlantic-testnet") | .rpcUrl' assets/networks.json)

cast rpc eth_getTransactionCount $ADDRESS latest --rpc-url $RPC_URL
```

**Output**: Hex nonce. Convert to decimal:
```bash
cast to-dec <hex_nonce>
```

**Activity level thresholds:**
- `0` → Uninitialized
- `1–19` → Low (limited history)
- `20–200` → Medium
- `201–1000` → High
- `>1000` → Very High (possible bot)

---

## Token Holdings

Query each known token from `assets/networks.json`:

```bash
ADDRESS=<wallet_address>
RPC_URL=$(jq -r '.networks[] | select(.name=="atlantic-testnet") | .rpcUrl' assets/networks.json)

# Read token list
TOKENS=$(jq -c '.networks[] | select(.name=="atlantic-testnet") | .knownTokens[]' assets/networks.json)

echo "$TOKENS" | while IFS= read -r token; do
  SYMBOL=$(echo $token | jq -r '.symbol')
  TOKEN_ADDR=$(echo $token | jq -r '.address')
  DECIMALS=$(echo $token | jq -r '.decimals')

  RAW=$(cast call $TOKEN_ADDR "balanceOf(address)(uint256)" $ADDRESS --rpc-url $RPC_URL)
  
  echo "$SYMBOL: $(cast from-wei $RAW) (raw: $RAW)"
done
```

---

## Wallet Age (Longevity)

Get the timestamp of the first block the wallet interacted with.
Since the public RPC doesn't expose a tx-list-by-address endpoint,
use the account's first known block via `eth_getAccount` nonce crosscheck,
or approximate from the current block and nonce:

```bash
RPC_URL=$(jq -r '.networks[] | select(.name=="atlantic-testnet") | .rpcUrl' assets/networks.json)

# Get latest block timestamp
LATEST_BLOCK=$(cast rpc eth_getBlockByNumber latest false --rpc-url $RPC_URL)
LATEST_TS=$(echo $LATEST_BLOCK | jq -r '.timestamp' | cast to-dec)
LATEST_NUM=$(echo $LATEST_BLOCK | jq -r '.number' | cast to-dec)

echo "Latest block: $LATEST_NUM at timestamp $LATEST_TS"
echo "Explorer link: $(jq -r '.networks[] | select(.name=="atlantic-testnet") | .explorerUrl' assets/networks.json)/address/$ADDRESS"
```

**Longevity thresholds (days since first tx):**
- Unknown → No tx history found
- `< 90 days` → New
- `90–365 days` → Mid-term
- `> 365 days` → Long-term

> For precise first-tx timestamp, direct the user to the explorer:
> `$EXPLORER/address/$ADDRESS`

---

## Risk Signals

Evaluate after collecting balance, tx count, and token data:

| Condition | Risk Signal |
|---|---|
| `txCount == 0` | ⚠️ Uninitialized wallet — no onchain activity |
| `txCount < 20` | ⚠️ Low activity — limited behavioral history |
| `balance == 0 AND txCount == 0` | 🔴 Empty wallet — never used |
| `txCount > 5000` | ⚠️ Very high activity — possible bot or automation |
| `balance > 0 AND txCount == 0` | ℹ️ Funded but never transacted — fresh wallet |

---

## Behavioral Score (0–100)

Compute after all queries are complete:

| Category | Max | Criteria |
|---|---|---|
| Activity | 30 | txCount: 0→0, 1-19→4, 20-49→8, 50-199→15, 200-999→22, 1000+→30 |
| Balance | 25 | 0→0, >0.01 PHRS→3, >0.1→8, >1→14, >10→20, >100→25 |
| Token diversity | 25 | tokens held: 0→0, 1→8, 2→16, 3+→25 |
| Longevity | 20 | Unknown→0, New→2, Mid-term→10, Long-term→20 |

**Reputation labels:**
- `0–19` → Minimal
- `20–39` → Sparse
- `40–59` → Developing
- `60–79` → Active
- `80–100` → Established

**Override rules:**
- `txCount == 0` → reputation = "Unknown" regardless of score
- `txCount < 20` → reputation = "Unverified"

---

## Sample Output

After running all steps, print this formatted report:

```
═══════════════════════════════════════════
  PHAROS WALLET ANALYSIS
═══════════════════════════════════════════
  Wallet:       0xfaC071...D84
  Network:      Atlantic Testnet

  Balance:      4.250000 PHRS
  Tx Count:     312
  Activity:     Medium

  Token Holdings:
    USDC:       150.00
    USDT:       0.00
    WPHRS:      2.10

  Longevity:    Long-term
  Score:        72 / 100
  Reputation:   Active

  Risk Signals: None

  Explorer:     https://pharosscan.xyz/address/0xfaC071...D84
═══════════════════════════════════════════
```
