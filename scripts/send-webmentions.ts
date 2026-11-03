import { parseArgs } from "node:util"
import { runSender } from "../src/lib/webmentionSender/runner"

async function main() {
  const { values } = parseArgs({
    options: {
      send: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      limit: { type: "string", default: "300" },
      post: { type: "string" },
      "budget-minutes": { type: "string" },
      help: { type: "boolean", default: false },
    },
  })
  if (values.help) {
    console.log(
      "send-webmentions [--send | --dry-run] [--limit=1..1000] [--post=ID] [--budget-minutes=1..360]"
    )
    return
  }
  const limit = Number(values.limit)
  const post = values.post === undefined ? undefined : Number(values.post)
  const budget =
    values["budget-minutes"] === undefined
      ? undefined
      : Number(values["budget-minutes"])
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
    throw new Error("Limit must be an integer from 1 to 1000")
  if (post !== undefined && (!Number.isSafeInteger(post) || post < 1))
    throw new Error("Post must be a positive integer")
  if (
    budget !== undefined &&
    (!Number.isInteger(budget) || budget < 1 || budget > 360)
  )
    throw new Error("Budget must be an integer from 1 to 360 minutes")
  if (values.send && values["dry-run"])
    throw new Error("Invalid combination: --send and --dry-run")
  await runSender({
    send: values.send,
    limit,
    post,
    statePath: "webmentions/sent.json",
    deadline: budget === undefined ? undefined : Date.now() + budget * 60000,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
