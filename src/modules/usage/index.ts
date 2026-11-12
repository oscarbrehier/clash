import { defineModule } from "../../core/modules/bot-module.ts"
import { usageCommand } from "./commands/usage-command.ts"
import { recordUsage } from "./record-usage.ts"

export default defineModule({
  name: "usage",
  commands: [usageCommand],

  hooks: {
    generationCompleted: recordUsage,
  },
})
