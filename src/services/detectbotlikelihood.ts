export function detectBotLikelihood(txs: any[]) {

  let botScore = 0;
  const reasons: string[] = [];

  if (!Array.isArray(txs) || txs.length === 0) {
    return {
      botScore: 0,
      isLikelyBot: false,
      reasons: ["No transaction data available"]
    };
  }

  if (txs.length > 5000) {
    botScore += 30;
    reasons.push("Extremely high transaction volume");
  } else if (txs.length > 1000) {
    botScore += 20;
    reasons.push("High transaction volume");
  }

 
  const timestamps = txs
    .map(t => Number(t.timeStamp))
    .filter(Boolean)
    .sort((a, b) => a - b);

  let regularIntervals = 0;

  for (let i = 2; i < timestamps.length; i++) {
    const d1 = timestamps[i - 1] - timestamps[i - 2];
    const d2 = timestamps[i] - timestamps[i - 1];

    // detect near-identical intervals (bot-like scheduling)
    if (Math.abs(d1 - d2) < 5) {
      regularIntervals++;
    }
  }

  if (regularIntervals > 20) {
    botScore += 25;
    reasons.push("Highly regular transaction timing detected");
  }


  let burstCount = 0;

  for (let i = 1; i < timestamps.length; i++) {
    const diff = timestamps[i] - timestamps[i - 1];

    if (diff < 30) burstCount++; // very rapid activity
  }

  if (burstCount > 100) {
    botScore += 25;
    reasons.push("Frequent rapid transaction bursts");
  }

 
  const uniqueContracts = new Set(
    txs.map(t => t.to?.toLowerCase()).filter(Boolean)
  ).size;

  if (txs.length > 100 && uniqueContracts < 5) {
    botScore += 20;
    reasons.push("Low contract diversity (repetitive interactions)");
  } else if (uniqueContracts < txs.length * 0.1) {
    botScore += 10;
    reasons.push("Moderate contract repetition detected");
  }


  const isLikelyBot = botScore >= 60;

  return {
    botScore,
    isLikelyBot,
    reasons
  };
}