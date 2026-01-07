
import { GoogleGenAI } from "@google/genai";

/**
 * Creates a fresh instance of GoogleGenAI using the current process.env.API_KEY.
 * This is crucial to pick up keys selected via the platform's key selection dialog.
 */
const getAiClient = () => {
  // Use process.env.API_KEY directly as per guidelines
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Tests the connection by performing a minimal content generation.
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const ai = getAiClient();
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'hi',
      // Removed maxOutputTokens to simplify and follow guidelines unless thinking budget is also set.
    });
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const getAiComment = async (
  target: number, 
  guess: number, 
  result: 'high' | 'low' | 'correct',
  attempts: number
): Promise<string> => {
  try {
    const ai = getAiClient();
    const resultText = result === 'correct' ? '정답입니다!' : result === 'high' ? '너무 높습니다' : '너무 낮습니다';
    
    const prompt = `
      상황: 사용자가 1~100 사이 숫자 맞추기 게임을 하고 있습니다.
      목표 숫자: ${target}
      방금 사용자가 입력한 숫자: ${guess}
      결과: ${resultText}
      현재까지 시도 횟수: ${attempts}
      
      지침:
      - 당신은 조금 까칠하지만 위트 있는 'AI 게임 마스터'입니다.
      - 결과에 대해 짧고(2문장 이내) 재미있게 코멘트해주세요.
      - 한국어로 답변해주세요.
      - 만약 시도 횟수가 많아지면 사용자를 살짝 놀려주세요.
      - 정답을 맞췄다면 마지못해 축하해주세요.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "운이 좋았거나, 아니면 실력이거나...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // If the error suggests key issues, it might be caught here
    if (error instanceof Error && error.message.includes("not found")) {
      return "API 키 설정에 문제가 있는 것 같군요. 설정을 확인해보세요.";
    }
    return "그냥 계속해보세요. 지켜보고 있습니다.";
  }
};
