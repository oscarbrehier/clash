import type {
  CommandDefinition,
  MessageContextCommand,
  SlashCommand,
  UserContextCommand,
} from "../modules/command-definition.ts"

export interface CommandIndex {
  slash(name: string): SlashCommand | undefined
  messageContext(name: string): MessageContextCommand | undefined
  userContext(name: string): UserContextCommand | undefined
}

export function indexCommands(commands: readonly CommandDefinition[]): CommandIndex {
  const slash = new Map<string, SlashCommand>()
  const messageContext = new Map<string, MessageContextCommand>()
  const userContext = new Map<string, UserContextCommand>()

  for (const command of commands) {
    if (command.type === "slash") {
      slash.set(command.data.name, command)
    }

    if (command.type === "message-context") {
      messageContext.set(command.data.name, command)
    }

    if (command.type === "user-context") {
      userContext.set(command.data.name, command)
    }
  }

  return {
    slash: (name) => slash.get(name),
    messageContext: (name) => messageContext.get(name),
    userContext: (name) => userContext.get(name),
  }
}
