// analyzeWallet.ts
// Main entry point for the Pharos Wallet Analyzer Skill.
// Wired to the Pharos public RPC — no Etherscan, no API key needed.

import { getWalletData } from "./pharos";
import { calculateScore } from "./scorer";
import { explain } from "./explainer";

export interface WalletAnalysis {
  wallet: string;
  balance: string;
  score: number;
  reputation: string;
  summary: string;
  riskSignals: string[];
  metrics: {
    txCount: number;
    activityLevel: "Low" | "Medium" | "High";
    longevity: "New" | "Mid-term" | "Long-term" | "Unknown";
  };
  scoreBreakdown: {
    activityScore: number;
    balanceScore: number;
    consistencyScore: number;
    longevityScore: number;
  };
}

export async function analyzeWallet(address: string): Promise<WalletAnalysis> {
  // Validate address format before making any RPC calls
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error(`Invalid EVM address: ${address}`);
  }

  const data = await getWalletData(address);

  const txs = Array.isArray(data.transactions) ? data.transactions : [];
  const txCount = data.txCount; // sourced from eth_getTransactionCount (nonce)

  // Only score if there is actual onchain activity
  const { score, breakdown } =
    txCount > 0 ? calculateScore(data) : {
      score: 0,
      breakdown: {
        activityScore: 0,
        balanceScore: 0,
        consistencyScore: 0,
        longevityScore: 0,
      },
    };

  const explanation = explain(score);

  // ----------------------------
  // ACTIVITY LEVEL
  // ----------------------------
  let activityLevel: "Low" | "Medium" | "High" = "Low";

  if (txCount > 1000) activityLevel = "High";
  else if (txCount > 200) activityLevel = "Medium";

  // ----------------------------
  // LONGEVITY
  // Sort ascending so [0] is always the oldest tx,
  // regardless of RPC return order.
  // ----------------------------
  let longevity: "New" | "Mid-term" | "Long-term" | "Unknown" = "Unknown";

  const oldestTx =
    txs.length > 0
      ? [...txs].sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp))[0]
      : null;

  if (oldestTx?.timeStamp) {
    const ageDays =
      (Date.now() - Number(oldestTx.timeStamp) * 1000) /
      (1000 * 60 * 60 * 24);

    if (ageDays > 365) longevity = "Long-term";
    else if (ageDays > 90) longevity = "Mid-term";
    else longevity = "New";
  }

  // ----------------------------
  // RISK SIGNALS
  // ----------------------------
  const riskSignals: string[] = [];

  if (txCount === 0) {
    riskSignals.push("No onchain activity detected (uninitialized wallet)");
  }

  if (txCount > 0 && txCount < 20) {
    riskSignals.push("Low activity wallet — limited behavioral history");
  }

  // Only flag weak score if there is enough history to judge
  if (score < 50 && txCount >= 20) {
    riskSignals.push("Weak behavioral pattern consistency");
  }

  if (txCount > 5000) {
    riskSignals.push(
      "High activity wallet — possible bot or automation behavior"
    );
  }

  // ----------------------------
  // REPUTATION
  // Align label confidence with available data quality.
  // ----------------------------
  let reputation: string = explanation.label;

  if (txCount === 0) {
    reputation = "Unknown";
  } else if (txCount < 20) {
    reputation = "Unverified"; // too thin to trust the label
  }

  return {
    wallet: address,
    balance: data.balanceEther,
    score,
    reputation,
    summary: explanation.summary,
    riskSignals,
    metrics: {
      txCount,
      activityLevel,
      longevity,
    },
    scoreBreakdown: breakdown,
  };
}
