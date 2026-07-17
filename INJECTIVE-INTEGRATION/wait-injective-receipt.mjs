// Injective public JSON-RPC can lag on eth_getTransactionReceipt while Blockscout
// has already indexed the block. Confirm the same hash without resubmitting it.
export async function waitForInjectiveReceipt(publicClient, hash, publisher, timeoutMs = 45000) {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1, timeout: Math.min(timeoutMs, 20000) })
    return { status: receipt.status, blockNumber: receipt.blockNumber, contractAddress: receipt.contractAddress || null }
  } catch { /* fall through to the public explorer index */ }

  const deadline = Date.now() + timeoutMs
  const endpoint = new URL('https://testnet.blockscout-api.injective.network/api')
  endpoint.searchParams.set('module', 'account')
  endpoint.searchParams.set('action', 'txlist')
  endpoint.searchParams.set('address', publisher)
  endpoint.searchParams.set('sort', 'desc')
  endpoint.searchParams.set('page', '1')
  endpoint.searchParams.set('offset', '20')
  while (Date.now() < deadline) {
    const response = await fetch(endpoint)
    const data = await response.json().catch(() => ({}))
    const transaction = Array.isArray(data?.result) ? data.result.find((item) => String(item.hash).toLowerCase() === hash.toLowerCase()) : null
    if (transaction?.blockNumber) {
      return {
        status: transaction.isError === '0' ? 'success' : 'reverted',
        blockNumber: BigInt(transaction.blockNumber),
        contractAddress: transaction.contractAddress || null,
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return null
}

