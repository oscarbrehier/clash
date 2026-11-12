import { defineModule } from "../../core/modules/bot-module.ts"
import { defaultModelCommand } from "./commands/default-model-command.ts"
import { modelCommand } from "./commands/model-command.ts"
import { settingsCommand } from "./commands/settings-command.ts"
import { applyModelTag } from "./tags/apply-model-tag.ts"

export default defineModule({
  name: "models",
  commands: [modelCommand, defaultModelCommand, settingsCommand],

  hooks: {
    sessionStarted: (event, context) => applyModelTag(context, event.channel, event.model),
    modelChanged: (event, context) => applyModelTag(context, event.channel, event.model),
  },
})
