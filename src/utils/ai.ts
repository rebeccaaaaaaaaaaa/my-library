type OpenAIChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const DEFAULT_MODEL = "gpt-4o-mini"

function getBaseUrl(): string {
  return (import.meta.env.VITE_OPENAI_BASE_URL as string | undefined)?.trim() || "https://api.openai.com/v1"
}

function getModel(): string {
  return (import.meta.env.VITE_OPENAI_MODEL as string | undefined)?.trim() || DEFAULT_MODEL
}

function getApiKey(): string {
  return (import.meta.env.VITE_OPENAI_API_KEY as string | undefined)?.trim() || ""
}

export async function explainSelectedTextWithAi(selectedText: string): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error("Chave da IA nao configurada. Defina VITE_OPENAI_API_KEY no ambiente.")
  }

  const cleanText = selectedText.trim()
  if (!cleanText) {
    throw new Error("Nao ha texto selecionado para explicar.")
  }

  const messages: OpenAIChatMessage[] = [
    {
      role: "system",
      content:
        "Voce e um tutor de leitura. Explique o trecho de forma clara, didatica e objetiva em portugues do Brasil. Traga: resumo em 2-3 frases, conceitos-chave em bullet points e um exemplo simples quando couber.",
    },
    {
      role: "user",
      content: `Explique o trecho abaixo:\n\n"${cleanText}"`,
    },
  ]

  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.3,
      messages,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Falha na IA (${response.status}): ${body || "erro desconhecido"}`)
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error("A IA nao retornou uma explicacao valida.")
  }

  return content
}
