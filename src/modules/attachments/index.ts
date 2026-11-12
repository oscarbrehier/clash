import { defineModule } from "../../core/modules/bot-module.ts"
import { readAttachments } from "./read-attachments.ts"

export default defineModule({
  name: "attachments",

  hooks: {
    transformUserInput: readAttachments,
  },
})
