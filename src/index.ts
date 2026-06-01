// index.ts
// Can be used two ways:
//   1. As a CLI: npx ts-node src/index.ts 0xYourAddress
//   2. As an imported tool in Claude Code / OpenClaw / Codex

import { analyzeWallet } from "./services/walletAnalyzer";

// ─── Agent Tool Export ─────────────────────────────────────────────────────
// Claude Code and compatible frameworks pick this up via the skill manifest.

export const tool = {
  name: "pharos_wallet_analyzer",
  description:
    "Analyzes a wallet address on the Pharos network. Returns balance, " +
    "score, reputation, risk signals, activity level, and wallet age. " +
    "Use this when the user asks about a wallet's reputation, history, " +
    "trust level, or activity on Pharos.",
  parameters: {
    type: "object",
    properties: {
      address: {
        type: "string",
        description: "EVM wallet address to analyze (0x...)",
      },
    },
    required: ["address"],
  },
  execute: async ({ address }: { address: string }) => {
    return analyzeWallet(address);
  },
};

// ─── CLI Usage ─────────────────────────────────────────────────────────────
const isMain =
  typeof process !== "undefined" &&
  process.argv[1]?.endsWith("index.ts");

if (isMain) {
  const address = process.argv[2];

  if (!address) {
    console.error("Usage: npx ts-node src/index.ts <wallet_address>");
    process.exit(1);
  }

  analyzeWallet(address)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("Error:", (err as Error).message);
      process.exit(1);
    });
}
