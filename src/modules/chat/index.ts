import { defineModule } from "../../core/modules/bot-module.ts"
import { forkButton } from "./actions/fork-button.ts"
import { regenerateButton } from "./actions/regenerate-button.ts"
import { stopButton } from "./actions/stop-button.ts"
import { initializeChatRuntime } from "./chat-runtime.ts"
import { chatCommand } from "./commands/chat-command.ts"
import { messageCreateEvent } from "./events/message-create.ts"
import { threadDeleteEvent } from "./events/thread-delete.ts"
import { verifyChannelsEvent } from "./events/verify-channels.ts"

export default defineModule({
  name: "chat",
  commands: [chatCommand],
  components: [stopButton, regenerateButton, forkButton],
  events: [messageCreateEvent, threadDeleteEvent, verifyChannelsEvent],

  setup(context) {
    initializeChatRuntime(context.logger)
  },
})
