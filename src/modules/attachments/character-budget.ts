export interface CharacterBudget {
  take(wanted: number): number
}

export function createCharacterBudget(total: number): CharacterBudget {
  let remaining = total

  return {
    take(wanted) {
      const granted = Math.min(wanted, remaining)
      remaining -= granted

      return granted
    },
  }
}
