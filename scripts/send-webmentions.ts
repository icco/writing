import { runSender } from "./runner"

async function main() {
  const args = process.argv.slice(2)
  const send = args.includes("--send")
  const limitArg = args.find(a => a.startsWith("--limit="))
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 300
  const postArg = args.find(a => a.startsWith("--post="))
  const post = postArg ? parseInt(postArg.split("=")[1], 10) : undefined

  console.log(`Starting webmention sender: send=${send}, limit=${limit}, post=${post ?? "all"}`)
  await runSender({ send, limit, post, statePath: "webmentions/sent.json" })
  console.log("Webmention sender completed successfully.")
}

if (process.argv[1]?.endsWith("send-webmentions.ts")) {
  main().catch(err => {
    console.error("Fatal error in send-webmentions:", err)
    process.exit(1)
  })
}
