import {
  type AnyThreadChannel,
  ChannelType,
  DiscordAPIError,
  type ForumChannel,
  RESTJSONErrorCodes,
} from "discord.js"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import type { CoreContext } from "../../../core/context.ts"
import { ensureModelTag } from "./ensure-model-tag.ts"
import { isModelTag } from "./model-tag-names.ts"

const discordAppliedTagLimit = 5

export async function applyModelTag(
  context: CoreContext,
  channel: AnyThreadChannel,
  model: ModelDefinition,
) {
  const forum = channel.parent

  if (forum?.type !== ChannelType.GuildForum) {
    return
  }

  try {
    await replaceModelTag(forum, channel, model)
  } catch (error) {
    reportTagFailure(context, channel, error)
  }
}

async function replaceModelTag(
  forum: ForumChannel,
  channel: AnyThreadChannel,
  model: ModelDefinition,
) {
  const tagId = await ensureModelTag(forum, model)

  if (!tagId) {
    return
  }

  const otherTags = channel.appliedTags.filter((id) => !isModelTag(forum, id))
  const nextTags = [tagId, ...otherTags].slice(0, discordAppliedTagLimit)

  if (sameTags(nextTags, channel.appliedTags)) {
    return
  }

  await channel.setAppliedTags(nextTags)
}

function sameTags(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id) => right.includes(id))
}

function reportTagFailure(context: CoreContext, channel: AnyThreadChannel, error: unknown) {
  const log = context.logger.child("models:tags")
  const missingPermission =
    error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions

  if (missingPermission) {
    log.warn(
      `Cannot manage forum tags in #${channel.parent?.name ?? "?"}: give the bot Manage Channels and Manage Threads on the forum`,
    )
    return
  }

  log.warn(`Could not update the model tag of ${channel.id}`, error)
}
