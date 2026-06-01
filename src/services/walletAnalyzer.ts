import { getWalletData } from "./etherscan";
import { calculateScore } from "./scorer";
import { explain } from "./explainer";

export async function analyzeWallet(address: string) {

  const data = await getWalletData(address);

  const txs = Array.isArray(data.transactions)
    ? data.transactions
    : [];

  const txCount = txs.length;

  const { score } = calculateScore(data);

  const explanation = explain(score);

  const botAnalysis = detectBotLikelihood(txs);


  let scoreContext = "Neutral";

  if (score >= 80) scoreContext = "Strong onchain reliability";
  else if (score >= 60) scoreContext = "Moderate reliability";
  else if (score >= 40) scoreContext = "Weak reliability signals";
  else scoreContext = "High uncertainty / risk profile";

  let activityLevel: "Low" | "Medium" | "High" = "Low";

  if (txCount > 1000) activityLevel = "High";
  else if (txCount > 200) activityLevel = "Medium";


  let longevity: "New" | "Mid-term" | "Long-term" | "Unknown" = "Unknown";

  const firstTx = txs[txs.length - 1];

  if (firstTx?.timeStamp) {

    const ageDays =
      (Date.now() - Number(firstTx.timeStamp) * 1000)
      / (1000 * 60 * 60 * 24);

    if (ageDays > 365) longevity = "Long-term";
    else if (ageDays > 90) longevity = "Mid-term";
    else longevity = "New";
  }


  const riskSignals: string[] = [];

  if (txCount === 0) {
    riskSignals.push("No onchain activity detected (uninitialized wallet)");
  }

  if (txCount > 0 && txCount < 20) {
    riskSignals.push("Low activity wallet - limited behavioral history");
  }

  if (score < 50 && txCount > 0) {
    riskSignals.push("Weak behavioral pattern consistency");
  }

  if (txCount > 5000) {
    riskSignals.push("High activity wallet - possible bot or automation behavior");
  }

  if (botAnalysis.isLikelyBot) {
    riskSignals.push(
      `Behavioral anomaly detected: ${botAnalysis.reasons.join(", ")}`
    );
  }


  let reputation = explanation.label;

  if (txCount === 0) {
    reputation = "Unknown";
  }

  if (botAnalysis.isLikelyBot && score >= 80) {
    reputation = "Normal";
  }

 
  function generateSummary() {

    if (txCount === 0) {
      return "This wallet has no onchain activity and cannot yet be behaviorally classified.";
    }

    if (botAnalysis.isLikelyBot) {
      return "This wallet shows automated behavioral patterns including high-frequency transactions and low contract diversity, indicating probable bot-driven activity.";
    }

    if (activityLevel === "High" && longevity === "Long-term") {
      return "This wallet demonstrates long-term consistent onchain activity with strong behavioral stability and diverse protocol interactions.";
    }

    if (activityLevel === "Low") {
      return "This wallet shows limited onchain engagement with low behavioral history, making classification less reliable.";
    }

    return `This wallet shows ${scoreContext.toLowerCase()} with moderate onchain interaction patterns across observed transactions.`;
  }


  return {
    wallet: address,
    score,
    reputation,
    summary: generateSummary(),

    riskSignals,

    metrics: {
      txCount,
      activityLevel,
      longevity
    },

    botRisk: {
      score: botAnalysis.botScore,
      isLikely: botAnalysis.isLikelyBot,
      reasons: botAnalysis.reasons
    },

    meta: {
      scoreContext
    }
  };
}


function detectBotLikelihood(txs: any[]) {

  let botScore = 0;
  const reasons: string[] = [];

  if (!Array.isArray(txs) || txs.length === 0) {
    return { botScore: 0, isLikelyBot: false, reasons: [] };
  }

  // volume
  if (txs.length > 5000) {
    botScore += 30;
    reasons.push("Extremely high transaction volume");
  } else if (txs.length > 1000) {
    botScore += 20;
    reasons.push("High transaction volume");
  }

  // timing analysis
  const timestamps = txs
    .map(t => Number(t.timeStamp))
    .filter(Boolean)
    .sort((a, b) => a - b);

  let rapid = 0;

  for (let i = 1; i < timestamps.length; i++) {
    const diff = timestamps[i] - timestamps[i - 1];

    if (diff < 30) rapid++;
  }

  if (rapid > 100) {
    botScore += 25;
    reasons.push("Frequent rapid transaction bursts");
  }

  // contract diversity
  const uniqueContracts = new Set(
    txs.map(t => t.to?.toLowerCase()).filter(Boolean)
  ).size;

  if (txs.length > 100 && uniqueContracts < 5) {
    botScore += 20;
    reasons.push("Low contract diversity (repetitive behavior)");
  }

  return {
    botScore,
    isLikelyBot: botScore >= 60,
    reasons
  };
}