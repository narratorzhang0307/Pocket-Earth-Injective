// Read a real Injective testnet transaction from RPC, with the public Blockscout
// archive as a fallback when a shared RPC node has pruned old transactions.
export async function getPublicTransactionEvidence(client, hash) {
  try {
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash }),
      client.getTransactionReceipt({ hash }),
    ])
    const block = await client.getBlock({ blockNumber: receipt.blockNumber })
    return { tx, receipt, block, evidenceSource: 'injective-rpc' }
  } catch {
    const baseUrl = `https://testnet.blockscout-api.injective.network/api/v2/transactions/${hash}`
    const [transactionResponse, logsResponse] = await Promise.all([
      fetch(baseUrl, { signal: AbortSignal.timeout(15000) }),
      fetch(`${baseUrl}/logs`, { signal: AbortSignal.timeout(15000) }),
    ])
    if (!transactionResponse.ok) throw new Error(`Blockscout transaction ${hash} returned HTTP ${transactionResponse.status}`)
    if (!logsResponse.ok) throw new Error(`Blockscout logs ${hash} returned HTTP ${logsResponse.status}`)

    const archived = await transactionResponse.json()
    const archivedLogs = await logsResponse.json()
    const timestampMs = Date.parse(archived.timestamp)
    if (!Number.isFinite(timestampMs)) throw new Error(`Blockscout transaction ${hash} has an invalid timestamp`)

    return {
      tx: {
        hash: archived.hash,
        from: archived.from?.hash || null,
        to: archived.to?.hash || null,
        input: archived.raw_input,
      },
      receipt: {
        status: archived.status === 'ok' ? 'success' : String(archived.status || 'failed'),
        blockNumber: BigInt(archived.block_number),
        contractAddress: archived.created_contract?.hash || null,
        logs: (archivedLogs.items || []).map((item) => ({
          address: item.address?.hash || null,
          data: item.data,
          topics: (item.topics || []).filter(Boolean),
        })),
      },
      block: { timestamp: BigInt(Math.floor(timestampMs / 1000)) },
      evidenceSource: 'injective-blockscout',
    }
  }
}
