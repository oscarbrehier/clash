import { type DiscordAPIError, RESTJSONErrorCodes } from "discord.js"

export function describeDiscordError(error: DiscordAPIError): string {
  if (error.code === RESTJSONErrorCodes.MissingPermissions) {
    return "I'm missing a permission in this channel (I need to send messages, manage threads and read history)."
  }

  if (error.code === RESTJSONErrorCodes.MissingAccess) {
    return "I can't access this channel. Check my channel permissions."
  }

  if (error.code === RESTJSONErrorCodes.UnknownMessage) {
    return "A message I was updating was deleted, so I stopped."
  }

  return `Discord rejected a request (code ${error.code}).`
}
