// scorer.ts
// Deterministic behavioral score (0–100) based on onchain data from Pharos.
// Higher score = more consistent, established wallet behavior.

import type { PharosWalletData } from "./pharos.js";

export interface ScoreResult {
  score: number;
  breakdown: {
    activityScore: number;    // 0–30: based on tx count
    balanceScore: number;     // 0–25: based on native balance
    consistencyScore: number; // 0–25: based on send/receive ratio
    longevityScore: number;   // 0–20: based on first tx age
  };
}

export function calculateScore(data: PharosWalletData): ScoreResult {
  const txCount = data.txCount;
  const txs = data.transactions;

  // --- Activity (0–30) ---
  let activityScore = 0;
  if (txCount >= 1000) activityScore = 30;
  else if (txCount >= 200) activityScore = 22;
  else if (txCount >= 50) activityScore = 15;
  else if (txCount >= 20) activityScore = 8;
  else if (txCount >= 5) activityScore = 4;

  // --- Balance (0–25) ---
  let balanceScore = 0;
  const balanceWei = BigInt(data.balanceWei);
  const oneEther = BigInt("1000000000000000000");

  if (balanceWei >= oneEther * BigInt(100)) balanceScore = 25;
  else if (balanceWei >= oneEther * BigInt(10)) balanceScore = 20;
  else if (balanceWei >= oneEther) balanceScore = 14;
  else if (balanceWei >= oneEther / BigInt(10)) balanceScore = 8;
  else if (balanceWei > BigInt(0)) balanceScore = 3;

  // --- Consistency (0–25): send/receive ratio diversity ---
  let consistencyScore = 0;
  if (txs.length > 0) {
    const address = data.address.toLowerCase();
    const sent = txs.filter((t) => t.from.toLowerCase() === address).length;
    const received = txs.length - sent;
    const total = txs.length;

    // Healthy wallets both send and receive
    const ratio = total > 0 ? Math.min(sent, received) / total : 0;
    consistencyScore = Math.round(ratio * 25);
  }

  // --- Longevity (0–20): age of oldest transaction ---
  let longevityScore = 0;
  if (txs.length > 0) {
    const sorted = [...txs].sort(
      (a, b) => Number(a.timeStamp) - Number(b.timeStamp)
    );
    const oldest = sorted[0];

    if (oldest?.timeStamp) {
      const ageDays =
        (Date.now() - Number(oldest.timeStamp) * 1000) / (1000 * 60 * 60 * 24);

      if (ageDays > 365) longevityScore = 20;
      else if (ageDays > 180) longevityScore = 15;
      else if (ageDays > 90) longevityScore = 10;
      else if (ageDays > 30) longevityScore = 5;
      else longevityScore = 2;
    }
  }

  const score = Math.min(
    100,
    activityScore + balanceScore + consistencyScore + longevityScore
  );

  return {
    score,
    breakdown: { activityScore, balanceScore, consistencyScore, longevityScore },
  };
}
