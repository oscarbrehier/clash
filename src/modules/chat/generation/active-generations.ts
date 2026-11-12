export interface ActiveGeneration {
  controller: AbortController
  requesterId: string
}

export interface ActiveGenerations {
  start(threadId: string, requesterId: string): AbortController
  finish(threadId: string, controller: AbortController): void
  find(threadId: string): ActiveGeneration | undefined
  abort(threadId: string): boolean
}

export function createActiveGenerations(): ActiveGenerations {
  const active = new Map<string, ActiveGeneration>()

  return {
    start(threadId, requesterId) {
      const controller = new AbortController()
      active.set(threadId, { controller, requesterId })

      return controller
    },

    finish(threadId, controller) {
      if (active.get(threadId)?.controller === controller) {
        active.delete(threadId)
      }
    },

    find: (threadId) => active.get(threadId),

    abort(threadId) {
      const generation = active.get(threadId)

      if (!generation) {
        return false
      }

      generation.controller.abort()
      return true
    },
  }
}
