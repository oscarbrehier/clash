export class GenerationTimeoutError extends Error {
  override readonly name = "GenerationTimeoutError"

  constructor() {
    super("The model stopped responding")
  }
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof GenerationTimeoutError) {
    return true
  }

  return error instanceof Error && error.name === "TimeoutError"
}
