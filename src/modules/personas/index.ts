import { defineModule } from "../../core/modules/bot-module.ts"
import { personaCommand } from "./commands/persona-command.ts"
import { customPersonaModal } from "./components/custom-persona-modal.ts"
import { resolvePersonaPrompt } from "./resolve-persona-prompt.ts"

export default defineModule({
  name: "personas",
  commands: [personaCommand],
  components: [customPersonaModal],

  hooks: {
    resolveSystemPrompt: resolvePersonaPrompt,
  },
})
