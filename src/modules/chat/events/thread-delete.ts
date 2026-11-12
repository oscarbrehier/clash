import { defineEvent } from "../../../core/modules/event-handler.ts"

export const threadDeleteEvent = defineEvent({
  event: "threadDelete",

  execute(context, thread) {
    context.sessions.threads.remove(thread.id)
  },
})
