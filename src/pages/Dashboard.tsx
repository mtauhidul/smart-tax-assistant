import { doc, getDoc } from "firebase/firestore";
import { ArrowRight, FileText, MessageSquare, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [formProgress, setFormProgress] = useState(0);
  const [userName, setUserName] = useState("");
  const [hasChatHistory, setHasChatHistory] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        // Set user name (use display name or email if no name is set)
        setUserName(
          userData?.displayName ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "Usuario"
        );

        // Calculate form progress (simple implementation - would be more sophisticated in reality)
        if (userData?.formData) {
          const formData = userData.formData;
          const totalFields = 10; // Example: total expected fields in a complete form
          const filledFields = Object.keys(formData).length;
          const progress = Math.min(
            Math.round((filledFields / totalFields) * 100),
            100
          );
          setFormProgress(progress);
        }

        // Check if user has chat history
        setHasChatHistory(
          !!userData?.chatHistory && userData.chatHistory.length > 2
        );
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleStartChat = () => {
    navigate("/chat-assistant");
  };

  const handleViewForm = () => {
    navigate("/form-review");
  };

  const handleEditProfile = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Asistente Fiscal</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hola, {userName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tu progreso</h2>
          <Card>
            <CardHeader>
              <CardTitle>Declaración de la Renta - Modelo 100</CardTitle>
              <CardDescription>
                {formProgress === 0
                  ? "Aún no has comenzado"
                  : formProgress === 100
                  ? "Formulario completado"
                  : `Progreso: ${formProgress}% completado`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={formProgress} className="h-2" />
            </CardContent>
            <CardFooter>
              {formProgress === 0 ? (
                <Button onClick={handleStartChat}>
                  Comenzar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : formProgress === 100 ? (
                <Button onClick={handleViewForm}>
                  Ver formulario completo <FileText className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={hasChatHistory ? handleStartChat : handleViewForm}
                >
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Asistente de chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Completa tu declaración paso a paso con la ayuda de nuestro
                asistente inteligente.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleStartChat}
                variant="outline"
                className="w-full"
              >
                {hasChatHistory ? "Continuar chat" : "Iniciar chat"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Formulario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Revisa y edita la información de tu declaración directamente.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleViewForm}
                variant="outline"
                className="w-full"
              >
                Ver formulario
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Actualiza tu información personal y preferencias.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleEditProfile}
                variant="outline"
                className="w-full"
              >
                Editar perfil
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}
