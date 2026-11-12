import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import type { BotModule } from "./bot-module.ts"
import { assertBotModule } from "./validate-module.ts"

const defaultModulesDirectory = join(import.meta.dir, "..", "..", "modules")

const disabledFolderPrefix = "_"

export async function loadModules(directory = defaultModulesDirectory): Promise<BotModule[]> {
  const folders = listModuleFolders(directory)
  const modules = await Promise.all(folders.map((folder) => importModule(directory, folder)))

  assertUniqueNames(modules)

  return modules
}

function listModuleFolders(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith(disabledFolderPrefix))
    .filter((name) => existsSync(join(directory, name, "index.ts")))
    .sort()
}

async function importModule(directory: string, folder: string): Promise<BotModule> {
  const entryUrl = pathToFileURL(join(directory, folder, "index.ts")).href
  const imported: { default?: unknown } = await import(entryUrl)

  assertBotModule(imported.default, folder)

  return imported.default
}

function assertUniqueNames(modules: readonly BotModule[]) {
  const seen = new Set<string>()

  for (const module of modules) {
    if (seen.has(module.name)) {
      throw new Error(`Two modules are named "${module.name}"`)
    }

    seen.add(module.name)
  }
}
