import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../components/ui/button";
import { ChatInterface } from "../components/ui/chat/ChatInterface";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  ChatMessage,
  createSystemPrompt,
  sendMessage,
} from "../services/openai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize chat with system prompt and welcome message
  useEffect(() => {
    const initChat = async () => {
      if (!user) return;

      try {
        // Check if user has existing chat session
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        // If user has previous form data, show option to continue
        if (userData?.formData && Object.keys(userData.formData).length > 0) {
          // If user already has chat history, load it
          if (userData.chatHistory && userData.chatHistory.length > 0) {
            setChatHistory(userData.chatHistory);
            const displayMessages: Message[] = userData.chatHistory
              .filter((msg: ChatMessage) => msg.role !== "system")
              .map((msg: ChatMessage) => ({
                id: uuidv4(),
                role: msg.role as "user" | "assistant",
                content: msg.content,
                timestamp: new Date(),
              }));
            setMessages(displayMessages);
            return;
          }
        }

        // Otherwise, start a new chat
        const systemPrompt = createSystemPrompt("Modelo 100");
        setChatHistory([systemPrompt]);

        // Add welcome message
        const welcomeMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content:
            "Hola, soy tu asistente fiscal para la declaración de la renta (Modelo 100). Voy a ayudarte a completar tu declaración paso a paso. Para empezar, ¿podrías decirme si presentaste declaración el año pasado?",
          timestamp: new Date(),
        };

        setMessages([welcomeMessage]);

        // Save initial chat state
        await updateDoc(doc(db, "users", user.uid), {
          chatHistory: [
            systemPrompt,
            {
              role: "assistant",
              content: welcomeMessage.content,
            },
          ],
        });
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("No se pudo iniciar la conversación");
      }
    };

    initChat();
  }, [user]);

  const handleSendMessage = async (messageText: string) => {
    if (!user) return;

    try {
      // Create new user message
      const newMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);

      // Update chat history
      const updatedChatHistory: ChatMessage[] = [
        ...chatHistory,
        { role: "user", content: messageText },
      ];

      // Send to OpenAI
      const response = await sendMessage(updatedChatHistory);

      // Add assistant response
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update chat history with the new messages
      const finalChatHistory: ChatMessage[] = [
        ...updatedChatHistory,
        { role: "assistant", content: response },
      ];

      setChatHistory(finalChatHistory);

      // Save to Firebase
      await updateDoc(doc(db, "users", user.uid), {
        chatHistory: finalChatHistory,
      });

      // Extract form data (simple implementation - would need to be more sophisticated)
      // This is just a placeholder to demonstrate the concept
      extractFormData(messageText, response);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("No se pudo procesar tu mensaje");
    } finally {
      setIsLoading(false);
    }
  };

  // Simple function to extract potential form data from conversations
  // In a real implementation, this would be more sophisticated
  const extractFormData = async (
    userMessage: string,
    assistantResponse: string
  ) => {
    if (!user) return;

    try {
      // Get current form data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const formData = userDoc.data()?.formData || {};

      // Very simplistic extraction (for demonstration only)
      // In reality, this would use a much more sophisticated approach

      // Example: Check if response contains DNI/NIE info
      if (userMessage.includes("DNI") || userMessage.includes("NIE")) {
        const dniMatch = userMessage.match(/[XYZ0-9]{8}[A-Z]/i);
        if (dniMatch) {
          formData.identification = dniMatch[0];
        }
      }

      // Example: Check for name info
      if (assistantResponse.includes("nombre completo")) {
        // This is just a placeholder - in reality, we'd use NLP to extract names
        const nameParts = userMessage.split(" ");
        if (nameParts.length >= 2) {
          formData.firstName = nameParts[0];
          formData.lastName = nameParts.slice(1).join(" ");
        }
      }

      // Save updated form data
      await updateDoc(doc(db, "users", user.uid), {
        formData,
      });
    } catch (error) {
      console.error("Error extracting form data:", error);
    }
  };

  const handleGoToForm = () => {
    navigate("/form-review");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Asistente Fiscal - Modelo 100</h1>
          <Button onClick={handleGoToForm}>Ver Formulario</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <ChatInterface
          onSendMessage={handleSendMessage}
          messages={messages}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
