import type { CoreContext } from "../context.ts"

export async function runModuleSetup(context: CoreContext) {
  for (const module of context.modules) {
    if (!module.setup) {
      continue
    }

    await module.setup(context)
  }
}
