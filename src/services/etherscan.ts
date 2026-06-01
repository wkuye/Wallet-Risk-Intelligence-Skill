import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API = "https://api.etherscan.io/v2/api";
export async function getWalletData(address: string) {

  const txList = await axios.get(API, {
  params: {
    chainid: 1,
    module: "account",
    action: "txlist",
    address,
    sort: "desc",
    apikey: process.env.ETHERSCAN_API_KEY,
  }
});

  console.log("ETHERSCAN TX RESPONSE:", txList.data);

  const balance = await axios.get(API, {
  params: {
    chainid: 1,
    module: "account",
    action: "balance",
    address,
    tag: "latest",
    apikey: process.env.ETHERSCAN_API_KEY,
  }
});

  return {
    transactions: Array.isArray(txList.data.result)
      ? txList.data.result
      : [],
    balance: balance.data.result || "0"
  };
}