import { doc, updateDoc } from "firebase/firestore";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Import sonner toast
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";

export default function Onboarding() {
  const steps = [
    { id: "welcome", title: "Bienvenido" },
    { id: "personal", title: "Datos Personales" },
    { id: "preferences", title: "Preferencias" },
    { id: "complete", title: "Completado" },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    identification: "",
    previouslyFiled: false,
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = async () => {
    // Validation for step 1
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        toast.error("Por favor, completa todos los campos obligatorios");
        return;
      }
    }

    // If we're on the last step, save all data and redirect
    if (currentStep === steps.length - 2) {
      if (!user) return;

      try {
        setIsLoading(true);

        // Save the onboarding data to Firestore
        await updateDoc(doc(db, "users", user.uid), {
          onboardingCompleted: true,
          firstName: formData.firstName,
          lastName: formData.lastName,
          identification: formData.identification,
          previouslyFiled: formData.previouslyFiled,
        });

        toast.success("Datos guardados exitosamente");
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error saving onboarding data:", error);
        toast.error("No se pudieron guardar tus datos");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? "bg-primary text-primary-foreground"
                        : index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Step 1: Welcome */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">
                Bienvenido al Asistente Fiscal
              </h2>
              <p className="text-center text-gray-600 max-w-md mx-auto">
                Te guiaremos paso a paso a través del proceso de declaración de
                impuestos en España. Primero, necesitamos algo de información
                básica.
              </p>
              <div className="flex justify-center pt-4">
                <img
                  src="/api/placeholder/280/160"
                  alt="Tax Assistant Logo"
                  className="w-40 h-40 object-contain"
                />
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Datos Personales</h2>
              <p className="text-gray-600 mb-4">
                Esta información es necesaria para completar tu declaración de
                impuestos.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="identification">DNI/NIE</Label>
                  <Input
                    id="identification"
                    value={formData.identification}
                    onChange={(e) =>
                      handleInputChange("identification", e.target.value)
                    }
                    placeholder="Ejemplo: 12345678Z"
                  />
                  <p className="text-xs text-gray-500">
                    Puedes añadir tu identificación ahora o más tarde durante el
                    proceso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Preferencias</h2>
              <p className="text-gray-600 mb-4">Personaliza tu experiencia.</p>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="previousYes"
                    name="previouslyFiled"
                    checked={formData.previouslyFiled === true}
                    onChange={() => handleInputChange("previouslyFiled", true)}
                  />
                  <Label htmlFor="previousYes">
                    Sí, he presentado declaración anteriormente
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="previousNo"
                    name="previouslyFiled"
                    checked={formData.previouslyFiled === false}
                    onChange={() => handleInputChange("previouslyFiled", false)}
                  />
                  <Label htmlFor="previousNo">
                    No, es mi primera declaración
                  </Label>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Esta información nos ayudará a personalizar mejor el asistente
                  a tus necesidades.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Completed */}
          {currentStep === 3 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
              </div>

              <h2 className="text-2xl font-bold">¡Configuración completada!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Has completado la configuración inicial. Ahora puedes comenzar a
                utilizar el asistente fiscal para completar tu declaración de la
                renta.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                Atrás
              </Button>
            )}

            {currentStep === 0 && <div></div>}

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={isLoading}>
                {currentStep === steps.length - 2
                  ? isLoading
                    ? "Guardando..."
                    : "Finalizar"
                  : "Siguiente"}
              </Button>
            ) : (
              <Button onClick={handleComplete}>Ir al panel principal</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
