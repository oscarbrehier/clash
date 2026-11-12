import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { CoreContext } from "../../../core/context.ts"
import { formatTokenCount } from "../../../core/formatting/format-tokens.ts"

export function describeModel(context: CoreContext, model: ModelDefinition): string {
  const details = [
    context.providers.displayNameOf(model.provider),
    `${formatTokenCount(model.contextWindow)} context`,
    model.vision ? "vision" : undefined,
    model.tools ? "tools" : undefined,
  ].filter((detail): detail is string => detail !== undefined)

  return `**${model.displayName}** (\`${model.id}\`) · ${details.join(" · ")}`
}
