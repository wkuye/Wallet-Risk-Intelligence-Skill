---
name: pharos-wallet-analyzer
description: >
  Analyzes any wallet address on Pharos — native balance, transaction count,
  token holdings, activity level, wallet age, behavioral reputation score,
  and risk signals. Uses cast/forge commands targeting Pharos RPC.
  Invoke when the user asks about a wallet's reputation, history, trust level,
  bot detection, or portfolio summary on the Pharos network.
version: 1.0.0
requires:
  anyBins:
    - cast
    - forge
---

# Pharos Wallet Analyzer Skill

Analyzes a wallet address on Pharos and returns a structured reputation report:
native balance, transaction count, ERC-20 token holdings, activity level,
wallet age (longevity), behavioral score (0–100), and risk signals.

## Prerequisites

1. **Install Foundry** (required for all operations):
   - First check: `which cast`
   - If not found, install:
     ```
     curl -L https://foundry.paradigm.xyz | bash
     source ~/.zshenv && foundryup
     cast --version
     ```
   - If installation fails, inform the user and STOP.

2. **Network config**: Read RPC URL from `assets/networks.json`.
   Default network is `atlantic-testnet` unless user specifies `mainnet`.

## Capability Index

| User Need | Capability | Instructions |
|---|---|---|
| Analyze wallet / reputation check | `cast balance` + `cast call` + tx count | → `references/analyze.md#full-wallet-analysis` |
| Check native PHRS balance | `cast balance` | → `references/analyze.md#native-balance` |
| Check ERC-20 token holdings | `cast call` (balanceOf) | → `references/analyze.md#token-holdings` |
| Transaction count / activity level | `cast rpc eth_getTransactionCount` | → `references/analyze.md#activity-level` |
| Wallet age / longevity | `cast rpc eth_getBlockByNumber` + first tx | → `references/analyze.md#wallet-age` |
| Risk signal detection | Combined analysis | → `references/analyze.md#risk-signals` |

## General Error Handling

| Error | CLI Signature | Handling |
|---|---|---|
| Invalid address | `invalid address` | Prompt: check 0x + 40 hex chars format |
| No activity found | Zero nonce + zero balance | Flag as uninitialized wallet |
| RPC unreachable | `connection refused` | Check network config in `assets/networks.json` |
| Missing Foundry | `command not found` | Run Foundry install steps above |

## Security Reminders

- Never expose private keys in logs or chat. Use `$PRIVATE_KEY` env var.
- Read operations (balance, tx count, contract calls) require no private key.
- This skill is read-only — it does not send transactions.
