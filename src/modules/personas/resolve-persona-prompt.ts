import type { SystemPromptRequest } from "../../core/hooks/chat-hooks.ts"
import { findPersona } from "./persona-catalog.ts"

export function resolvePersonaPrompt(request: SystemPromptRequest): string | undefined {
  const personaId = request.thread.personaId

  return personaId ? findPersona(personaId)?.prompt : undefined
}
