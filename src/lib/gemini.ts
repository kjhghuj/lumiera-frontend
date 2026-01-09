"use client";

import { GoogleGenAI, Chat } from "@google/genai";
import { GEMINI_SYSTEM_INSTRUCTION } from "./constants";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

function getAI() {
  if (!ai && apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export const initChat = () => {
  const genAI = getAI();
  if (!genAI) return null;

  chatSession = genAI.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!apiKey) {
    return "I'm sorry, I'm currently offline (API Key missing).";
  }

  if (!chatSession) {
    initChat();
  }

  if (!chatSession) {
    return "I'm sorry, I couldn't initialize the chat service.";
  }

  try {
    const response = await chatSession.sendMessage({
      message,
    });
    return response.text || "I'm listening, but I couldn't quite catch that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

export default { initChat, sendMessageToGemini };
