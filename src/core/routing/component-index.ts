import type {
  ButtonHandler,
  ComponentHandler,
  ModalHandler,
  StringSelectHandler,
} from "../modules/component-handler.ts"

export interface ComponentIndex {
  button(id: string): ButtonHandler | undefined
  modal(id: string): ModalHandler | undefined
  stringSelect(id: string): StringSelectHandler | undefined
}

export function indexComponents(components: readonly ComponentHandler[]): ComponentIndex {
  const buttons = new Map<string, ButtonHandler>()
  const modals = new Map<string, ModalHandler>()
  const stringSelects = new Map<string, StringSelectHandler>()

  for (const component of components) {
    if (component.type === "button") {
      buttons.set(component.id, component)
    }

    if (component.type === "modal") {
      modals.set(component.id, component)
    }

    if (component.type === "string-select") {
      stringSelects.set(component.id, component)
    }
  }

  return {
    button: (id) => buttons.get(id),
    modal: (id) => modals.get(id),
    stringSelect: (id) => stringSelects.get(id),
  }
}
