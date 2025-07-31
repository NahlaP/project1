import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const generateImage = async (prompt: string): Promise<string[]> => {
  try {
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return result.data?.map((img) => img.url!).filter(Boolean) || [];
  } catch (err) {
    console.error("generateImage failed", err);
    return [];
  }
};
