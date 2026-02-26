export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Return click stats
    if (url.searchParams.get("getClicks")) {
      const list = await env.CLICKS_KV.list()
      const results = {}

      for (const key of list.keys) {
        const value = await env.CLICKS_KV.get(key.name)
        results[key.name.replace("click-", "")] = parseInt(value || "0")
      }

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      })
    }

    // Track redirect
    const target = url.searchParams.get("url") || "https://example.com"
    const key = `click-${target}`

    let count = await env.CLICKS_KV.get(key)
    count = parseInt(count || "0") + 1
    await env.CLICKS_KV.put(key, count.toString())

    return Response.redirect(target, 302)
  }
}
