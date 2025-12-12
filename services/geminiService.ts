import { GoogleGenAI, SchemaType } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const DIRECTOR_SYSTEM_PROMPT = `
你是一个“剧本杀（Murder Mystery）”的人类导播AI助手。
你的目标是协助人类导播控制 NPC Agent（智能体），使故事更具戏剧性或打破僵局。
人类会输入模糊意图（例如：“让 A 怀疑 B” 或 “制造混乱”）。
你必须输出一个结构化的 JSON 建议。
`;

export const getDirectorSuggestions = async (intent: string, contextSummary: string) => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return {
      actionType: "MEMORY_INJECTION",
      target: "All",
      details: "模拟数据：API Key 未配置。针对意图的模拟建议：" + intent,
      reasoning: "这是一个演示用的模拟推理，用于展示界面交互。"
    };
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
    当前剧情简报: ${contextSummary}
    导播意图: "${intent}"
    
    请生成一个具体的游戏干预动作。
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: DIRECTOR_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            actionType: { type: SchemaType.STRING, enum: ["MEMORY_INJECTION", "ENV_EVENT", "ATTITUDE_CHANGE"], description: "干预类型" },
            target: { type: SchemaType.STRING, description: "目标 Agent 名字 或 'Global'" },
            details: { type: SchemaType.STRING, description: "具体的注入内容或事件描述" },
            reasoning: { type: SchemaType.STRING, description: "为什么这个动作有助于剧情发展" }
          },
          required: ["actionType", "target", "details", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const summarizeDialogues = async (dialogues: string[]) => {
    if (!apiKey) return "模拟摘要：角色们正在客厅激烈讨论死者的遗产分配问题。";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `用中文一句话总结这些最新的游戏日志，用于仪表盘展示: \n${dialogues.join('\n')}`,
        });
        return response.text;
    } catch (e) {
        return "无法生成摘要";
    }
};
