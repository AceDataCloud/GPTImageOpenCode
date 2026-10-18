import test from "node:test"
import assert from "node:assert/strict"
import { restrictImageTools } from "../src/image-scope.js"

function registry(entries) {
  const items = new Map(entries.map((entry) => [entry.id, entry]))
  return {
    items,
    list: () => [...items.values()],
    remove: (id) => items.delete(id),
    update: (id, fn) => fn(items.get(id)),
  }
}
const ns = "gptimage-by-acedatacloud"
const entry = (name, input = {}) => ({ id: `${ns}_${name}`, name, options: { namespace: ns }, input, execute: async (args) => args })

test("only this plugin's three image/task tools survive; model enum excludes other services", async () => {
  const schema = { type: "object", properties: { model: { enum: ["gpt-image-1", "dall-e-3", "nano-banana"], default: "gpt-image-1" } } }
  const other = { ...entry("chat"), id: "other_chat", options: { namespace: "other" } }
  const r = registry([entry("openai_generate_image", schema), entry("openai_edit_image", schema), entry("openai_get_task"), entry("openai_chat"), other])
  restrictImageTools(r, ns)
  assert.equal(r.items.size, 4)
  assert(r.items.has("other_chat"))
  assert(!r.items.has(`${ns}_openai_chat`))
  const tool = r.items.get(`${ns}_openai_generate_image`)
  assert.deepEqual(tool.input.properties.model.enum, ["gpt-image-1"])
  assert.deepEqual(await tool.execute({ model: "gpt-image-1" }), { model: "gpt-image-1" })
  assert.throws(() => tool.execute({ model: "nano-banana" }), /GPT Image/)
  assert.throws(() => tool.execute({}), /GPT Image/)
  assert.equal(tool.input.properties.model.default, undefined)
  assert(tool.input.required.includes("model"))
  assert.deepEqual(schema.properties.model.enum, ["gpt-image-1", "dall-e-3", "nano-banana"])
})

test("unknown upstream model schema hides submissions instead of exposing a broader endpoint", () => {
  const r = registry([entry("openai_generate_image", { type: "object" }), entry("openai_get_task")])
  restrictImageTools(r, ns)
  assert.equal(r.items.size, 1)
  assert(r.items.has(`${ns}_openai_get_task`))
})


test("a broad upstream edit default is removed and a GPT Image model becomes explicit", () => {
  const r = registry([entry("openai_edit_image", { type: "object", properties: { model: { enum: ["dall-e-3", "gpt-image-1"], default: "dall-e-3" } } })])
  restrictImageTools(r, ns)
  const tool = r.items.get(`${ns}_openai_edit_image`)
  assert.deepEqual(tool.input.properties.model.enum, ["gpt-image-1"])
  assert.equal(tool.input.properties.model.default, undefined)
  assert(tool.input.required.includes("model"))
})
