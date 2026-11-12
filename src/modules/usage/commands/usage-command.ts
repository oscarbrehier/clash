import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import type { CoreContext } from "../../../core/context.ts"
import { replyEphemeral } from "../../../core/discord/interaction-replies.ts"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"
import { usageReport } from "../format/usage-report.ts"
import { topUsers, usageByModel } from "../queries/summarize-usage.ts"
import {
  defaultUsagePeriod,
  isUsagePeriod,
  periodStart,
  type UsagePeriod,
  usagePeriods,
} from "../usage-period.ts"

const periodChoices = Object.entries(usagePeriods).map(([value, period]) => ({
  name: period.choice,
  value,
}))

const data = new SlashCommandBuilder()
  .setName("usage")
  .setDescription("Show token usage and estimated cost")
  .addStringOption((option) =>
    option
      .setName("period")
      .setDescription("Time range (default: last 30 days)")
      .addChoices(...periodChoices),
  )
  .addUserOption((option) =>
    option.setName("user").setDescription("Show another member's usage (server managers only)"),
  )
  .addBooleanOption((option) =>
    option.setName("server").setDescription("Show the whole server (server managers only)"),
  )

export const usageCommand: SlashCommand = {
  type: "slash",
  data,
  execute: showUsage,
}

async function showUsage(interaction: ChatInputCommandInteraction<"cached">, context: CoreContext) {
  const period = readPeriod(interaction)
  const targetUser = interaction.options.getUser("user") ?? interaction.user
  const wholeServer = interaction.options.getBoolean("server") ?? false
  const needsManager = wholeServer || targetUser.id !== interaction.user.id

  if (needsManager && !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await replyEphemeral(interaction, "Only server managers can see other people's usage.")
    return
  }

  const filter = { guildId: interaction.guildId, since: periodStart(period) }
  const modelName = (modelId: string) => context.models.find(modelId)?.displayName ?? modelId
  const periodLabel = usagePeriods[period].label

  const report = wholeServer
    ? usageReport({
        heading: "**Server usage**",
        periodLabel,
        models: usageByModel(context.db, filter),
        users: topUsers(context.db, filter),
        modelName,
      })
    : usageReport({
        heading: `**Usage of <@${targetUser.id}>**`,
        periodLabel,
        models: usageByModel(context.db, { ...filter, userId: targetUser.id }),
        modelName,
      })

  await replyEphemeral(interaction, report)
}

function readPeriod(interaction: ChatInputCommandInteraction<"cached">): UsagePeriod {
  const value = interaction.options.getString("period")

  return value && isUsagePeriod(value) ? value : defaultUsagePeriod
}
