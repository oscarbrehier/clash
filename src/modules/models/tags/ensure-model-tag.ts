import type { ForumChannel } from "discord.js"
import type { ModelDefinition } from "../../../core/config/model-catalog.ts"
import { findTagByName } from "./model-tag-names.ts"

const discordForumTagLimit = 20

const pendingCreations = new Map<string, Promise<string | undefined>>()

export function ensureModelTag(
  forum: ForumChannel,
  model: ModelDefinition,
): Promise<string | undefined> {
  const existing = findTagByName(forum, model.tagName)

  if (existing) {
    return Promise.resolve(existing.id)
  }

  const key = `${forum.id}:${model.tagName}`
  const inFlight = pendingCreations.get(key)

  if (inFlight) {
    return inFlight
  }

  const creation = createTag(forum, model.tagName).finally(() => pendingCreations.delete(key))
  pendingCreations.set(key, creation)

  return creation
}

async function createTag(forum: ForumChannel, name: string): Promise<string | undefined> {
  if (forum.availableTags.length >= discordForumTagLimit) {
    return undefined
  }

  const updated = await forum.setAvailableTags([...forum.availableTags, { name }])

  return findTagByName(updated, name)?.id
}
