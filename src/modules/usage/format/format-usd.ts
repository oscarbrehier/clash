const smallAmount = 0.01

export function formatUsd(amount: number): string {
  if (amount === 0) {
    return "$0.00"
  }

  return amount < smallAmount ? `$${amount.toFixed(4)}` : `$${amount.toFixed(2)}`
}
