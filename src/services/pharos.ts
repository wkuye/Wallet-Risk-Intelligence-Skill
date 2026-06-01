// pharos.ts
// Fetches wallet data directly from the Pharos public RPC endpoint.
// Replaces any Etherscan dependency with native JSON-RPC calls.
// Chain ID: 0x688 (1672) | RPC: https://rpc.pharos.xyz

const PHAROS_RPC = "https://rpc.pharos.xyz";

// ------------------------------------------------------------
// Low-level JSON-RPC helper
// ------------------------------------------------------------
async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(PHAROS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  if (!res.ok) {
    throw new Error(`Pharos RPC HTTP error: ${res.status}`);
  }

  const json = (await res.json()) as { result?: T; error?: { message: string } };

  if (json.error) {
    throw new Error(`Pharos RPC error: ${json.error.message}`);
  }

  return json.result as T;
}

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export interface PharosTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;        // hex wei
  gas: string;          // hex
  gasPrice: string;     // hex
  blockNumber: string;  // hex
  timeStamp: string;    // unix seconds (string) — derived from block
  nonce: string;        // hex
  input: string;
}

export interface PharosWalletData {
  address: string;
  balanceWei: string;   // hex wei
  balanceEther: string; // human-readable
  txCount: number;      // from eth_getTransactionCount (nonce)
  transactions: PharosTransaction[];
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function hexToDecimal(hex: string): bigint {
  return BigInt(hex);
}

function weiToEther(wei: bigint): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(6) + " PHAR";
}

// Pharos doesn't expose a native tx-list-by-address endpoint on the
// public RPC (that's an explorer API feature). We use eth_getLogs for
// transfer events and eth_getTransactionCount as a proxy for activity.
// For a production skill, pair this with the Pharos Explorer API when
// it becomes publicly available.
async function getRecentTransactions(
  address: string
): Promise<PharosTransaction[]> {
  try {
    // Fetch the latest block number to build a reasonable range
    const latestHex = await rpc<string>("eth_blockNumber", []);
    const latest = parseInt(latestHex, 16);

    // Scan the last 2000 blocks for transactions involving this address
    const fromBlock = Math.max(0, latest - 2000);
    const fromBlockHex = "0x" + fromBlock.toString(16);

    // ERC-20 Transfer topic (also covers native sends via logs from wrappers)
    const transferTopic =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    const addressPadded =
      "0x000000000000000000000000" + address.replace("0x", "").toLowerCase();

    // Fetch logs where address is sender or receiver
    const [sentLogs, receivedLogs] = await Promise.all([
      rpc<RawLog[]>("eth_getLogs", [
        {
          fromBlock: fromBlockHex,
          toBlock: "latest",
          topics: [transferTopic, addressPadded],
        },
      ]),
      rpc<RawLog[]>("eth_getLogs", [
        {
          fromBlock: fromBlockHex,
          toBlock: "latest",
          topics: [transferTopic, null, addressPadded],
        },
      ]),
    ]);

    // Deduplicate by tx hash
    const seen = new Set<string>();
    const allLogs = [...sentLogs, ...receivedLogs].filter((log) => {
      if (seen.has(log.transactionHash)) return false;
      seen.add(log.transactionHash);
      return true;
    });

    // Fetch block timestamps in parallel (batched to avoid rate limits)
    const blockNumbers = [...new Set(allLogs.map((l) => l.blockNumber))];
    const blockTimestamps = await fetchBlockTimestamps(blockNumbers);

    const txs: PharosTransaction[] = allLogs.map((log) => ({
      hash: log.transactionHash,
      from: log.topics[1]
        ? "0x" + log.topics[1].slice(26)
        : address,
      to: log.topics[2] ? "0x" + log.topics[2].slice(26) : null,
      value: log.data,
      gas: "0x0",
      gasPrice: "0x0",
      blockNumber: log.blockNumber,
      timeStamp: String(blockTimestamps[log.blockNumber] ?? 0),
      nonce: "0x0",
      input: "0x",
    }));

    return txs;
  } catch {
    // Graceful fallback — return empty if logs fail
    return [];
  }
}

interface RawLog {
  transactionHash: string;
  blockNumber: string;
  topics: string[];
  data: string;
  address: string;
}

interface BlockResult {
  timestamp: string;
}

async function fetchBlockTimestamps(
  blockNumbers: string[]
): Promise<Record<string, number>> {
  const timestamps: Record<string, number> = {};

  // Batch in groups of 10 to stay within rate limits
  const BATCH = 10;
  for (let i = 0; i < blockNumbers.length; i += BATCH) {
    const batch = blockNumbers.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((bn) =>
        rpc<BlockResult>("eth_getBlockByNumber", [bn, false])
      )
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled" && result.value?.timestamp) {
        timestamps[batch[idx]] = parseInt(result.value.timestamp, 16);
      }
    });
  }

  return timestamps;
}

// ------------------------------------------------------------
// Main export: getWalletData
// ------------------------------------------------------------
export async function getWalletData(address: string): Promise<PharosWalletData> {
  const [balanceHex, txCountHex, transactions] = await Promise.all([
    rpc<string>("eth_getBalance", [address, "latest"]),
    rpc<string>("eth_getTransactionCount", [address, "latest"]),
    getRecentTransactions(address),
  ]);

  const balanceWei = hexToDecimal(balanceHex);
  const txCount = parseInt(txCountHex, 16);

  return {
    address,
    balanceWei: balanceHex,
    balanceEther: weiToEther(balanceWei),
    txCount,
    transactions,
  };
}
