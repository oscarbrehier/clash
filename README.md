# Discord AI Chatbot

A private, ChatGPT/Claude-style AI chatbot for your own Discord server. Every forum post (or thread) is one conversation: the bot keeps the full context, streams its answers, names the post, and tags it with the model in use.

- **Many ways to start a chat:** a post in the chat forum, a message in the ask channel, `/chat new`, or mentioning the bot in any channel
- **Streaming answers:** messages are edited about once per 1.2 s and split safely at 2,000 characters, without breaking code blocks
- **Multiple providers:** Anthropic, OpenAI, Google, Mistral, OpenRouter and local Ollama, enabled by whichever keys you set
- **Per-chat settings:** `/model`, `/persona`, `/settings`, plus forum tags that show each chat's model
- **Buttons:** ⏹️ Stop, 🔄 Regenerate and 🍴 Fork on every reply
- **Attachments:** images go to vision models; text, code and PDF files are added as context
- **Usage tracking:** tokens and estimated cost per user and model, shown by `/usage`
- **Private by design:** only allowlisted servers, an optional required role, and keys that never appear in logs
- **Modular:** a new feature is a new folder in `src/modules/`

Built with Bun, TypeScript (strict), discord.js v14, the Vercel AI SDK, SQLite + Drizzle ORM and zod.

---

## 1. Discord Developer Portal setup

1. Open <https://discord.com/developers/applications> → **New Application**.
2. **Bot** tab:
   - **Reset Token** and copy it. This is `DISCORD_TOKEN`; keep it secret.
   - Under **Privileged Gateway Intents**, turn on **Message Content Intent**. Without it the bot sees empty messages.
3. **Installation** tab: set **Install Link** to **None** and save. Optionally untick **User Install**.
4. **Bot** tab again: turn **Public Bot** off and save. This only works after step 3, because Discord refuses with _"Private application cannot have a default authorization link"_ while an install link exists.
5. **General Information** tab: copy the **Application ID**. This is `DISCORD_CLIENT_ID`.
6. **OAuth2** tab → **OAuth2 URL Generator**:
   - **Scopes:** `bot`, `applications.commands`
   - **Bot permissions:** View Channels, Send Messages, Send Messages in Threads, Create Public Threads, Manage Threads, Read Message History, Embed Links
   - Open the generated URL and add the bot to your server.
7. On the **chat forum channel only**, also give the bot **Manage Channels**. It needs this to create the model tags. Giving it only on the forum keeps the bot's rights small.

**Intents used:** Guilds, Guild Messages, Message Content. No member or presence intents are needed.

### Channels in your server

| Channel                               | Purpose                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forum** (for example `#chats`)      | Each post is a conversation. Create it with **Create Channel → Forum**. If _Forum_ is missing, enable **Community** in the server settings first. |
| **Text channel** (for example `#ask`) | Optional. Every message here starts a new forum post, and the bot replies with an **Open chat** button.                                           |

To copy IDs, enable **User Settings → Advanced → Developer Mode**, then right-click a server, channel or role and choose **Copy … ID**.

---

## 2. Configuration

Copy `.env.example` to `.env` and fill it in. Everything is validated at startup; a mistake prints which variable is wrong without showing any values.

| Variable                       | Required | Description                                                                          |
| ------------------------------ | -------- | ------------------------------------------------------------------------------------ |
| `DISCORD_TOKEN`                | ✅       | Bot token (Bot tab)                                                                  |
| `DISCORD_CLIENT_ID`            | ✅       | Application ID (General Information tab)                                             |
| `ALLOWED_GUILD_IDS`            | ✅       | Comma-separated server IDs. The bot leaves any other server immediately.             |
| `DEV_GUILD_IDS`                |          | Servers that `bun run register` pushes commands to. Defaults to `ALLOWED_GUILD_IDS`. |
| `REQUIRED_ROLE_ID`             |          | Only members with this role (and admins) can use the bot                             |
| `CHAT_FORUM_CHANNEL_ID`        |          | The chat forum. Without it, chats open as threads in text channels.                  |
| `ASK_CHANNEL_ID`               |          | The ask channel                                                                      |
| `DEFAULT_MODEL_ID`             | ✅       | `id` from `config/models.ts` for new chats (changeable with `/default-model`)        |
| `TITLE_MODEL_ID`               | ✅       | A cheap, fast model that writes chat titles                                          |
| `ANTHROPIC_API_KEY`            |          | Enables Anthropic models                                                             |
| `OPENAI_API_KEY`               |          | Enables OpenAI models                                                                |
| `GOOGLE_GENERATIVE_AI_API_KEY` |          | Enables Google Gemini models                                                         |
| `MISTRAL_API_KEY`              |          | Enables Mistral models (Codestral, Mistral Large, Mistral Small)                     |
| `OPENROUTER_API_KEY`           |          | Enables OpenRouter models                                                            |
| `OLLAMA_BASE_URL`              |          | Enables local Ollama, for example `http://localhost:11434`                           |
| `DATABASE_PATH`                |          | SQLite file, default `./data/bot.db`                                                 |
| `LOG_LEVEL`                    |          | `debug`, `info` (default), `warn` or `error`                                         |

At least one provider must be enabled, and `DEFAULT_MODEL_ID` and `TITLE_MODEL_ID` must belong to an enabled provider.

> **Note:** a Claude Pro/Max subscription does not include API access. The API is billed separately at <https://platform.claude.com>. Gemini (Google AI Studio) has a free tier that works well for testing.

---

## 3. Run locally

```bash
bun install
cp .env.example .env
bun run register
bun run dev
```

| Script                            | What it does                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`                     | Start with auto-reload                                                                                                 |
| `bun run start`                   | Start once                                                                                                             |
| `bun run register`                | Register slash commands in `DEV_GUILD_IDS` (instant). `-- --global` registers globally; `-- --clear` removes them all. |
| `bun run typecheck`               | TypeScript check                                                                                                       |
| `bun run lint` / `bun run format` | Biome lint / auto-format                                                                                               |
| `bun run db:generate`             | Create a migration after changing a `schema.ts`. Migrations apply automatically on startup.                            |

Run `bun run register` again whenever you add or change a command.

---

## 4. Run with Docker

```bash
cp .env.example .env
docker compose build
docker compose run --rm bot bun scripts/register-commands.ts
docker compose up -d
docker compose logs -f bot
```

- The database lives in the `bot-data` volume, so it survives restarts and rebuilds.
- The container runs as a non-root user, restarts automatically, and rotates its logs (3 × 10 MB).
- **Ollama on the host machine:** set `OLLAMA_BASE_URL=http://host.docker.internal:11434`.
- **Update:** pull the new code, then `docker compose up -d --build`.

---

## 5. Using the bot

### Starting a chat

| How                                    | What happens                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New post in the chat forum             | The bot answers in the post.                                                                                                                           |
| Message in the ask channel             | A forum post is created with your message, plus a reply with an **Open chat** button. Without a chat forum, a thread opens under your message instead. |
| `/chat new [prompt] [model] [persona]` | Creates a post (or a thread in the current channel), optionally with a persona from the start.                                                         |
| `@Bot your question` in any channel    | Starts a thread from your message.                                                                                                                     |

After the first answer, the title model renames the chat (at most twice, because Discord allows only two renames per 10 minutes). Messages sent while the bot is still answering are answered together right afterwards.

### Commands

| Command                                           | Who                                         | Description                                                 |
| ------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| `/chat new`                                       | everyone                                    | Start a new chat                                            |
| `/model [model]`                                  | view: everyone · switch: owner / moderators | Show or switch this chat's model (also swaps the forum tag) |
| `/default-model [model]`                          | Manage Server                               | Default model for new chats                                 |
| `/settings show` · `/settings max-tokens [value]` | view: everyone · change: owner / moderators | Show settings or limit reply length                         |
| `/persona set` · `custom` · `clear`               | owner / moderators                          | Presets or your own system prompt                           |
| `/persona list`                                   | everyone                                    | Show the available personas                                 |
| `/usage [period] [user] [server]`                 | everyone (others: Manage Server)            | Tokens and estimated cost                                   |
| `/ping`                                           | everyone                                    | Health check                                                |

"Moderators" means members with **Manage Threads**.

### Buttons

- **⏹️ Stop** (while streaming) keeps the text written so far.
- **🔄 Regenerate** (latest reply only) replaces the reply. It also appears on error messages so you can retry.
- **🍴 Fork** copies the conversation up to that reply into a new post with the same model and persona.

### Attachments

| Type                         | Limit               | Handling                                               |
| ---------------------------- | ------------------- | ------------------------------------------------------ |
| Images (png, jpg, gif, webp) | 5 MB, 4 per message | Sent to vision models; stored, so they stay in context |
| Text and code files          | 512 KB              | Contents added to the conversation                     |
| PDF                          | 20 MB               | Text extracted and added                               |
| Anything else                | —                   | The model is told it was skipped and tells you         |

---

## 6. Models, pricing and personas

### `config/models.ts`

```ts
{
  id: "claude-sonnet",
  displayName: "Claude Sonnet 5.5",
  provider: "anthropic",
  providerModelId: "claude-sonnet-5-5",
  tagName: "Claude Sonnet",
  contextWindow: 1_000_000,
  maxOutputTokens: 32_000,
  vision: true,
  tools: true,
  pricing: { inputPerMillionTokens: 2, outputPerMillionTokens: 10, cachedInputPerMillionTokens: 0.2 },
}
```

- `id` is what `.env`, `/model` and the database use; `providerModelId` is what the provider expects.
- `tagName` is the forum tag. It must be unique and at most 20 characters.
- `tools: true` gives the model access to tools registered by modules.
- `pricing` is optional and is used by `/usage`. Without it, cost shows as _no price set_.

Models whose provider has no key are hidden automatically. If a model hangs without answering (some Gemini models do on the free tier), the bot gives up after 2 minutes. Point `providerModelId` at a model your key can use.

### `config/personas.ts`

Each persona has an `id`, `name`, `emoji`, `description` and `prompt`. Discord formatting rules and the current date are always added after the persona's prompt.

---

## 7. Writing a module

A module is a folder in `src/modules/<name>/` whose `index.ts` default-exports one object. The core finds it automatically; you never edit the core to add a feature.

```ts
interface BotModule {
  name: string
  commands?: CommandDefinition[]
  components?: ComponentHandler[]
  events?: EventHandler[]
  tools?: ToolSet
  hooks?: Partial<ChatHooks>
  setup?(context: CoreContext): void | Promise<void>
}
```

Every handler receives the `CoreContext`: `client`, `env`, `logger`, `db`, `sessions` (threads, messages, guild settings), `models`, `providers`, `hooks`, `tools`, `access` and `modules`.

### Example: a dice module

`src/modules/dice/index.ts`

```ts
import { defineModule } from "../../core/modules/bot-module.ts"
import { rollCommand } from "./commands/roll.ts"
import { rollDiceTool } from "./tools/roll-dice.ts"

export default defineModule({
  name: "dice",
  commands: [rollCommand],
  tools: { rollDice: rollDiceTool },

  hooks: {
    generationCompleted: (event, context) => {
      context.logger.child("dice").debug(`${event.userId} used ${event.model.id}`)
    },
  },
})
```

`src/modules/dice/commands/roll.ts`

```ts
import { SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../../core/modules/command-definition.ts"

export const rollCommand: SlashCommand = {
  type: "slash",

  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a die")
    .addIntegerOption((option) =>
      option.setName("sides").setDescription("Number of sides").setMinValue(2),
    ),

  async execute(interaction) {
    const sides = interaction.options.getInteger("sides") ?? 6
    const result = 1 + Math.floor(Math.random() * sides)

    await interaction.reply({ content: `🎲 You rolled **${result}** (d${sides})` })
  },
}
```

`src/modules/dice/tools/roll-dice.ts`: models with `tools: true` can call this during any chat.

```ts
import { tool } from "ai"
import { z } from "zod"

export const rollDiceTool = tool({
  description: "Roll one or more dice and return each result",
  inputSchema: z.object({
    count: z.number().int().min(1).max(20),
    sides: z.number().int().min(2).max(1000),
  }),

  execute: async ({ count, sides }) => ({
    rolls: Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides)),
  }),
})
```

Then run `bun run register` and restart. While a model is using a tool, the reply shows a small "🔧 Using rollDice…" line.

### Building blocks

- **Commands:** `type: "slash"` (with optional `autocomplete`), `"message-context"` or `"user-context"`. The core checks the guild allowlist and the required role before any handler runs.
- **Components:** buttons, modals and string selects are routed by custom ID. Use `encodeCustomId("dice:reroll", ...args)` for the ID; the handler's `id` is the first two parts (`"dice:reroll"`) and receives the rest as `args`.
- **Events:** `defineEvent({ event: "messageCreate", execute(context, message) { … } })`, with any discord.js client event.
- **Hooks**, so modules can extend chats without importing each other:

  | Hook                  | When                                        | Return                             |
  | --------------------- | ------------------------------------------- | ---------------------------------- |
  | `resolveSystemPrompt` | building the prompt                         | a system prompt, or `undefined`    |
  | `transformUserInput`  | a user message is saved                     | the message parts (add text/files) |
  | `sessionStarted`      | a new chat begins                           | —                                  |
  | `generationCompleted` | a reply or title finished, with token usage | —                                  |
  | `modelChanged`        | `/model` switched the model                 | —                                  |

- **Database tables:** put a Drizzle table in `src/modules/<name>/schema.ts` and run `bun run db:generate`. The migration is created and then applied on the next start.
- **Turning a module off:** rename its folder to start with `_` (for example `_dice`).

### Code style

No comments. Small functions, one responsibility per file, early returns, explicit types at module boundaries, no `any`. `bun run typecheck` and `bun run lint` must pass.

---

## 8. Project structure

```
config/              models.ts, personas.ts
drizzle/             generated migrations
scripts/             register-commands.ts
src/
  index.ts
  core/              bootstrap, config, db, discord, hooks, logging, modules, providers, routing, sessions
  modules/
    attachments/     images, text files, PDFs
    chat/            conversations, streaming, splitting, titles, buttons
    health/          /ping
    models/          /model, /default-model, /settings, forum tags
    personas/        /persona
    usage/           usage tracking, /usage
```

---

## 9. Troubleshooting

| Symptom                                                        | Fix                                                                                                                                                               |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The bot never answers                                          | Turn on **Message Content Intent**; check the post is in `CHAT_FORUM_CHANNEL_ID`; check `REQUIRED_ROLE_ID`. Set `LOG_LEVEL=debug` to see `Generating in …` lines. |
| Answers hang, then "stopped responding"                        | The provider never replied. Usually a model your key/tier can't use; change `providerModelId`.                                                                    |
| "⚠️ … rejected the API key"                                    | Wrong or missing key in `.env`                                                                                                                                    |
| No forum tags                                                  | Give the bot **Manage Channels** on the forum. The log names the missing permission.                                                                              |
| A post isn't renamed                                           | Discord allows 2 renames per 10 minutes per channel; the bot skips renames instead of waiting.                                                                    |
| Commands don't show up                                         | Run `bun run register`, then restart Discord (Ctrl+R).                                                                                                            |
| "Private application cannot have a default authorization link" | Set **Installation → Install Link** to **None** first.                                                                                                            |
