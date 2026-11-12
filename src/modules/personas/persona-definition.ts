import { z } from "zod"

export const personaSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "use lowercase letters, digits and dashes"),
  name: z.string().min(1).max(40),
  emoji: z.string().min(1).max(8),
  description: z.string().min(1).max(80),
  prompt: z.string().min(1).max(4_000),
})

export type Persona = z.infer<typeof personaSchema>

export function definePersonas(list: Persona[]): Persona[] {
  return list
}
