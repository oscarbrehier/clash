export interface ThrottledTask {
  request(): void
  flush(): Promise<void>
}

export function createThrottledTask(
  task: () => Promise<void>,
  intervalMs: number,
  onError: (error: unknown) => void,
): ThrottledTask {
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastRunAt = 0
  let dirty = false
  let queue: Promise<void> = Promise.resolve()

  const runSafely = async () => {
    try {
      await task()
    } catch (error) {
      onError(error)
    }
  }

  const run = () => {
    timer = undefined

    if (!dirty) {
      return queue
    }

    dirty = false
    lastRunAt = Date.now()
    queue = queue.then(runSafely)

    return queue
  }

  const request = () => {
    dirty = true

    if (timer) {
      return
    }

    const wait = Math.max(0, lastRunAt + intervalMs - Date.now())
    timer = setTimeout(run, wait)
  }

  const flush = async () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }

    dirty = true
    await run()
  }

  return { request, flush }
}
