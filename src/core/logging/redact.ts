const redactedMarker = "[redacted]"

export type Redactor = (text: string) => string

export function createRedactor(secrets: readonly string[]): Redactor {
  const sortedSecrets = [...secrets].sort((a, b) => b.length - a.length)

  return (text) =>
    sortedSecrets.reduce((result, secret) => result.replaceAll(secret, redactedMarker), text)
}
