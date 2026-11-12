import type { CoreContext } from "../context.ts"
import type {
  ChatHooks,
  GenerationCompletedEvent,
  ModelChangedEvent,
  SessionStartedEvent,
  SystemPromptRequest,
  UserContentParts,
  UserInputRequest,
} from "./chat-hooks.ts"

export interface HookRegistration {
  moduleName: string
  hooks: Partial<ChatHooks>
}

export interface HookBus {
  resolveSystemPrompt(request: SystemPromptRequest): Promise<string | undefined>
  transformUserInput(request: UserInputRequest): Promise<UserContentParts>
  emitSessionStarted(event: SessionStartedEvent): Promise<void>
  emitGenerationCompleted(event: GenerationCompletedEvent): Promise<void>
  emitModelChanged(event: ModelChangedEvent): Promise<void>
}

type BroadcastHook = "sessionStarted" | "generationCompleted" | "modelChanged"

type HookRunner = (hooks: Partial<ChatHooks>, context: CoreContext) => unknown

export function createHookBus(
  registrations: readonly HookRegistration[],
  getContext: () => CoreContext,
): HookBus {
  const reportFailure = (moduleName: string, hook: keyof ChatHooks, error: unknown) => {
    getContext()
      .logger.child("hooks")
      .error(`Hook "${hook}" of module "${moduleName}" failed`, error)
  }

  const broadcast = async (hook: BroadcastHook, run: HookRunner) => {
    const tasks = registrations.map(async (registration) => {
      try {
        await run(registration.hooks, getContext())
      } catch (error) {
        reportFailure(registration.moduleName, hook, error)
      }
    })

    await Promise.all(tasks)
  }

  const resolveSystemPrompt = async (request: SystemPromptRequest) => {
    for (const registration of registrations) {
      const resolver = registration.hooks.resolveSystemPrompt

      if (!resolver) {
        continue
      }

      try {
        const prompt = await resolver(request, getContext())

        if (prompt !== undefined) {
          return prompt
        }
      } catch (error) {
        reportFailure(registration.moduleName, "resolveSystemPrompt", error)
      }
    }

    return undefined
  }

  const transformUserInput = async (request: UserInputRequest) => {
    let parts = request.parts

    for (const registration of registrations) {
      const transform = registration.hooks.transformUserInput

      if (!transform) {
        continue
      }

      try {
        parts = await transform({ ...request, parts }, getContext())
      } catch (error) {
        reportFailure(registration.moduleName, "transformUserInput", error)
      }
    }

    return parts
  }

  return {
    resolveSystemPrompt,
    transformUserInput,

    emitSessionStarted: (event: SessionStartedEvent) =>
      broadcast("sessionStarted", (hooks, context) => hooks.sessionStarted?.(event, context)),

    emitGenerationCompleted: (event: GenerationCompletedEvent) =>
      broadcast("generationCompleted", (hooks, context) =>
        hooks.generationCompleted?.(event, context),
      ),

    emitModelChanged: (event: ModelChangedEvent) =>
      broadcast("modelChanged", (hooks, context) => hooks.modelChanged?.(event, context)),
  }
}
