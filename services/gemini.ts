export async function getGeminiResponse(userPrompt: string, imageBase64?: string): Promise<string> {
  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userPrompt,
        image: imageBase64,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data?.text || 'No response generated.';
  } catch (error: any) {
    console.error('Gemini Gateway Error:', error);
    throw error;
  }
}
