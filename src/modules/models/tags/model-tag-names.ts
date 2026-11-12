import type { ForumChannel, GuildForumTag } from "discord.js"
import { models as catalog } from "../../../../config/models.ts"

const modelTagNames = new Set(catalog.map((model) => normalizeTagName(model.tagName)))

export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase()
}

export function findTagByName(forum: ForumChannel, name: string): GuildForumTag | undefined {
  const wanted = normalizeTagName(name)

  return forum.availableTags.find((tag) => normalizeTagName(tag.name) === wanted)
}

export function isModelTag(forum: ForumChannel, tagId: string): boolean {
  const tag = forum.availableTags.find((candidate) => candidate.id === tagId)

  return tag !== undefined && modelTagNames.has(normalizeTagName(tag.name))
}
