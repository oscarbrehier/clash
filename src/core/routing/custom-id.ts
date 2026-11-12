const separator = ":"

const discordCustomIdLimit = 100

const handlerIdSegments = 2

export interface DecodedCustomId {
  id: string
  args: string[]
}

export function encodeCustomId(id: string, ...args: string[]): string {
  const encoded = [id, ...args].join(separator)

  if (encoded.length > discordCustomIdLimit) {
    throw new Error(`Custom ID "${encoded}" exceeds ${discordCustomIdLimit} characters`)
  }

  return encoded
}

export function decodeCustomId(raw: string): DecodedCustomId {
  const segments = raw.split(separator)

  return {
    id: segments.slice(0, handlerIdSegments).join(separator),
    args: segments.slice(handlerIdSegments),
  }
}
