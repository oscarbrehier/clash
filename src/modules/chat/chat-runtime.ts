import type { Logger } from "../../core/logging/logger.ts"
import { type ActiveGenerations, createActiveGenerations } from "./generation/active-generations.ts"
import {
  createGenerationScheduler,
  type GenerationScheduler,
} from "./generation/generation-scheduler.ts"

export interface ChatRuntime {
  scheduler: GenerationScheduler
  generations: ActiveGenerations
}

let runtime: ChatRuntime | undefined

export function initializeChatRuntime(logger: Logger) {
  runtime = {
    scheduler: createGenerationScheduler(logger.child("chat:scheduler")),
    generations: createActiveGenerations(),
  }
}

export function chatRuntime(): ChatRuntime {
  if (!runtime) {
    throw new Error("The chat module was used before its setup ran")
  }

  return runtime
}
