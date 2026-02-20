
import { GoogleGenAI } from "@google/genai";
import { OHLCData } from "../types";

export const getMarketAnalysis = async (data: OHLCData[], symbol: string, imageData?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const recentData = data.slice(-25).map(d => {
    const timeStr = typeof d.time === 'number' 
      ? new Date(d.time * 1000).toISOString().split('T')[0] 
      : String(d.time);
    return `${timeStr}: H:${d.high} L:${d.low} C:${d.close}`;
  }).join(' | ');
  
  const textPart = {
    text: `Analyze the following chart for ${symbol}. 
    Data: ${recentData}.
    ${imageData ? 'I have also provided a visual screenshot of the chart for your analysis.' : ''}
    Provide a professional, concise market update.`
  };

  const contents = imageData ? {
    parts: [
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageData.split(',')[1], // Remove prefix
        },
      },
      textPart,
    ],
  } : textPart;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents as any,
      config: {
        systemInstruction: `You are a world-class financial technical analyst. 
        Analyze both provided visual data (if any) and raw price levels.
        Provide a concise update with:
        - **Sentiment**: (Bullish/Bearish/Neutral)
        - **Visual Pattern**: (e.g. Head & Shoulders, Double Top, Bull Flag)
        - **Key Levels**: Specific support/resistance.
        - **Trader Insight**: One sentence action advice.
        Use markdown and be extremely brief.`,
      },
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Insight currently unavailable. Please check your network or API key.";
  }
};
