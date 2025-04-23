import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const API_URL = "https://api.openai.com/v1/chat/completions";

// Define OpenAI message types
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Creates a system prompt for the Spanish tax assistant
 * @param taxForm The tax form being completed (e.g., "Modelo 100")
 * @returns A system message for the OpenAI API
 */
export const createSystemPrompt = (taxForm: string): ChatMessage => {
  return {
    role: "system",
    content: `Eres un asistente fiscal especializado en impuestos españoles, ayudando a un contribuyente a completar el ${taxForm}.
    
Tu objetivo es guiar al usuario paso a paso a través del proceso de declaración de impuestos, utilizando términos fiscales españoles oficiales y explicándolos cuando sea necesario.

Haz preguntas claras y directas para obtener la información necesaria para completar el formulario.
Explica los términos técnicos en español sencillo.
Proporciona orientación sobre deducciones o créditos fiscales que puedan aplicarse.
Responde a cualquier pregunta del usuario sobre el proceso fiscal español.

Importante: No solicites información personal sensible como números completos de DNI/NIE, direcciones exactas o datos bancarios detallados. 

Mantén un tono profesional pero amable, y comunícate exclusivamente en español.`,
  };
};

/**
 * Sends a message to the OpenAI API and returns the response
 * @param messages Array of message objects to send to OpenAI
 * @returns The assistant's response message
 */
export const sendMessage = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const response = await axios.post<OpenAIResponse>(
      API_URL,
      {
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to get response from AI assistant");
  }
};
