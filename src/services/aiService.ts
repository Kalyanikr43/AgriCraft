const APP_ID = import.meta.env.VITE_APP_ID;
const AI_API_URL = 'https://api-integrations.appmedo.com/app-7tqb6jyvh98h/api-rLob8RdzAOl9/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

interface AIMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

interface AIResponse {
  candidates: Array<{
    content: {
      role: string;
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export async function classifyWaste(imageFile: File): Promise<{
  detectedType: string;
  confidence: string;
  guidance: string;
  fullResponse: string;
}> {
  const base64Image = await fileToBase64(imageFile);
  const base64Data = base64Image.split(',')[1];

  const prompt = `You are an agricultural waste classification expert. Analyze this image and determine if it contains one of these agricultural waste types:
1. Coconut shell
2. Banana stem
3. Rice husk

Respond in this exact format:
DETECTED TYPE: [coconut_shell OR banana_stem OR rice_husk OR unknown]
CONFIDENCE: [high OR medium OR low]
GUIDANCE: [If detected, provide 3-5 step-by-step instructions for creating handmade products from this waste. Be specific and practical. If unknown, explain why it couldn't be classified.]

Be concise and practical in your guidance.`;

  const messages: AIMessage[] = [
    {
      role: 'user',
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Data
          }
        }
      ]
    }
  ];

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': APP_ID
      },
      body: JSON.stringify({
        contents: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr.trim()) {
            try {
              const data: AIResponse = JSON.parse(jsonStr);
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                fullText += data.candidates[0].content.parts[0].text;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    }

    return parseAIResponse(fullText);
  } catch (error) {
    console.error('AI classification error:', error);
    throw new Error('Failed to classify waste. Please try again.');
  }
}

function parseAIResponse(response: string): {
  detectedType: string;
  confidence: string;
  guidance: string;
  fullResponse: string;
} {
  const detectedTypeMatch = response.match(/DETECTED TYPE:\s*(\w+)/i);
  const confidenceMatch = response.match(/CONFIDENCE:\s*(\w+)/i);
  const guidanceMatch = response.match(/GUIDANCE:\s*([\s\S]+?)(?=\n\n|$)/i);

  return {
    detectedType: detectedTypeMatch?.[1]?.toLowerCase() || 'unknown',
    confidence: confidenceMatch?.[1]?.toLowerCase() || 'low',
    guidance: guidanceMatch?.[1]?.trim() || 'No guidance available.',
    fullResponse: response
  };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
