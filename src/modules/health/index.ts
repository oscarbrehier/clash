import { defineModule } from "../../core/modules/bot-module.ts"
import { pingCommand } from "./commands/ping.ts"

export default defineModule({
  name: "health",
  commands: [pingCommand],
})
