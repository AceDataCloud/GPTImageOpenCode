export const IMAGE_TOOLS = new Set(["openai_generate_image", "openai_edit_image", "openai_get_task"])

export function restrictImageTools(editor, namespace) {
  for (const tool of editor.list()) {
    if (tool.options?.namespace !== namespace) continue
    if (!IMAGE_TOOLS.has(tool.name)) {
      editor.remove(tool.id)
      continue
    }
    if (tool.name === "openai_get_task") continue
    const schema = tool.input
    const property = schema?.properties?.model
    const models = property?.enum?.filter((value) => typeof value === "string" && value.startsWith("gpt-image-"))
    if (!models?.length) {
      // A changed/unknown schema must not silently expose the broader server.
      editor.remove(tool.id)
      continue
    }
    const execute = tool.execute
    editor.update(tool.id, (entry) => {
      const { default: inheritedDefault, ...modelSchema } = property
      entry.input = {
        ...schema,
        required: [...new Set([...(schema.required ?? []), "model"])],
        properties: {
          ...schema.properties,
          model: { ...modelSchema, description: "Required GPT Image model from this tool's current gpt-image-* enum.", enum: models },
        },
      }
      entry.description = `GPT Image by Ace Data Cloud: ${tool.name === "openai_edit_image" ? "edit an image" : "generate an image"}. Choose an explicit advertised GPT Image model and approve current cost before submitting. Preserve the returned task_id; query it with openai_get_task(id=...).`
      entry.execute = (input, context) => {
        if (!models.includes(input?.model)) {
          throw new Error("Choose a currently advertised GPT Image model; other image/model services are outside this plugin.")
        }
        return execute(input, context)
      }
    })
  }
}
