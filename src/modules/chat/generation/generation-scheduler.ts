import type { Logger } from "../../../core/logging/logger.ts"

export type GenerationTask = () => Promise<void>

export interface GenerationScheduler {
  schedule(threadId: string, task: GenerationTask): void
  isBusy(threadId: string): boolean
}

export function createGenerationScheduler(logger: Logger): GenerationScheduler {
  const running = new Set<string>()
  const pending = new Map<string, GenerationTask>()

  const runSafely = async (task: GenerationTask) => {
    try {
      await task()
    } catch (error) {
      logger.error("Generation task failed", error)
    }
  }

  const takePending = (threadId: string) => {
    const next = pending.get(threadId)
    pending.delete(threadId)

    return next
  }

  const drain = async (threadId: string, first: GenerationTask) => {
    running.add(threadId)

    let next: GenerationTask | undefined = first

    while (next) {
      await runSafely(next)
      next = takePending(threadId)
    }

    running.delete(threadId)
  }

  return {
    schedule(threadId, task) {
      if (running.has(threadId)) {
        pending.set(threadId, task)
        return
      }

      void drain(threadId, task)
    },

    isBusy: (threadId) => running.has(threadId),
  }
}
