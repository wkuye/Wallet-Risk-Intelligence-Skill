export function calculateScore(data: any) {

  let score = 50;

  const txs = Array.isArray(data.transactions)
    ? data.transactions
    : [];

  if (txs.length === 0) {
    return {
      score: 20
    };
  }

 
  if (txs.length > 100) score += 10;
  if (txs.length > 500) score += 15;


  const validTxs = txs.filter((t: any) => t.timeStamp);

  if (validTxs.length > 0) {

    const oldest = validTxs[validTxs.length - 1];

    const ageDays =
      (Date.now() - Number(oldest.timeStamp) * 1000)
      / (1000 * 60 * 60 * 24);

    if (ageDays > 365) score += 15;
    if (ageDays < 30) score -= 20;
  }

  const failedTx = txs.filter(
    (t: any) => t.isError === "1"
  );

  if (failedTx.length > 10) score -= 10;

  return {
    score: Math.max(0, Math.min(100, score))
  };
}