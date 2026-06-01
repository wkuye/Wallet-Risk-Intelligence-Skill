import { analyzeWallet } from "./services/walletAnalyzer";

async function run() {

  const wallet = process.argv[2];

  if (!wallet) {
    console.log("Provide wallet address");
    return;
  }

  const result = await analyzeWallet(wallet);

  console.log(JSON.stringify(result, null, 2));
}

run();