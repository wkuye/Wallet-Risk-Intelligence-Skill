// explainer.ts


export interface Explanation {
  label: string;
  summary: string;
}

export function explain(score: number): Explanation {
  if (score >= 80) {
    return {
      label: "Established",
      summary:
        "This wallet has strong onchain history on Pharos — high activity, " +
        "healthy balance, and consistent behavioral patterns over time.",
    };
  }

  if (score >= 60) {
    return {
      label: "Active",
      summary:
        "This wallet is reasonably active on Pharos with a solid transaction " +
        "history and a recognizable usage pattern.",
    };
  }

  if (score >= 40) {
    return {
      label: "Developing",
      summary:
        "This wallet shows moderate onchain presence on Pharos. More history " +
        "is needed to establish a strong behavioral profile.",
    };
  }

  if (score >= 20) {
    return {
      label: "Sparse",
      summary:
        "Limited onchain activity detected on Pharos. The wallet exists but " +
        "has not yet built a meaningful behavioral footprint.",
    };
  }

  return {
    label: "Minimal",
    summary:
      "Very little or no verifiable onchain activity found for this address " +
      "on the Pharos network.",
  };
}
