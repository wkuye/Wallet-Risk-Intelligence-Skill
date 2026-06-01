export function explain(score: number) {

  if (score >= 80) {
    return {
      label: "Trusted",
      summary: "This wallet shows long-term consistent activity with healthy onchain behavior."
    };
  }

  if (score >= 60) {
    return {
      label: "Normal",
      summary: "This wallet appears active but has limited historical depth."
    };
  }

  if (score >= 40) {
    return {
      label: "Caution",
      summary: "This wallet shows mixed behavior and may require further verification."
    };
  }

  return {
    label: "High Risk",
    summary: "This wallet shows patterns commonly associated with risky or new accounts."
  };
}