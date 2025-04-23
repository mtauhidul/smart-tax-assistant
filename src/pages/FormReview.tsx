import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PDFDocument } from "pdf-lib";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Import sonner toast
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";

// Simple initial form structure
interface FormData {
  // Identification
  identification?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;

  // Income
  employmentIncome?: string;
  selfEmploymentIncome?: string;
  capitalGains?: string;
  otherIncome?: string;

  // Deductions
  housingDeduction?: string;
  pensionContributions?: string;
  charitableDonations?: string;
  otherDeductions?: string;
}

export default function FormReview() {
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (userData?.formData) {
          setFormData(userData.formData);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("No se pudo cargar el formulario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [user]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveForm = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await updateDoc(doc(db, "users", user.uid), {
        formData,
      });

      toast.success("Los cambios se han guardado correctamente");
    } catch (error) {
      console.error("Error saving form data:", error);
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Create a simple PDF (placeholder)
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size

      // Add form title
      page.drawText("Declaración de la Renta - Modelo 100", {
        x: 50,
        y: 800,
        size: 18,
      });

      // Add form data
      let yPosition = 750;
      const addField = (label: string, value: string | undefined) => {
        if (value) {
          page.drawText(`${label}: ${value}`, {
            x: 50,
            y: yPosition,
            size: 12,
          });
          yPosition -= 20;
        }
      };

      // Add personal data
      page.drawText("Datos Personales", { x: 50, y: yPosition, size: 14 });
      yPosition -= 30;
      addField("DNI/NIE", formData.identification);
      addField("Nombre", formData.firstName);
      addField("Apellidos", formData.lastName);
      addField("Dirección", formData.address);
      addField("Código Postal", formData.postalCode);
      addField("Ciudad", formData.city);
      addField("Provincia", formData.province);

      // Add income data
      yPosition -= 20;
      page.drawText("Ingresos", { x: 50, y: yPosition, size: 14 });
      yPosition -= 30;
      addField("Rendimientos del trabajo", formData.employmentIncome);
      addField("Actividades económicas", formData.selfEmploymentIncome);
      addField("Ganancias patrimoniales", formData.capitalGains);
      addField("Otros ingresos", formData.otherIncome);

      // Add deductions
      yPosition -= 20;
      page.drawText("Deducciones", { x: 50, y: yPosition, size: 14 });
      yPosition -= 30;
      addField("Deducción vivienda", formData.housingDeduction);
      addField(
        "Aportaciones a planes de pensiones",
        formData.pensionContributions
      );
      addField("Donativos", formData.charitableDonations);
      addField("Otras deducciones", formData.otherDeductions);

      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Create a download link
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "declaracion_renta_modelo100.pdf";
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("La declaración se ha generado correctamente");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("No se pudo generar el PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleBackToChat = () => {
    navigate("/chat-assistant");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Revisión del Formulario - Modelo 100
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToChat}>
              Volver al chat
            </Button>
            <Button onClick={handleSaveForm} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="personal">
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Datos Personales</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="deductions">Deducciones</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="identification">DNI/NIE</Label>
                    <Input
                      id="identification"
                      value={formData.identification || ""}
                      onChange={(e) =>
                        handleInputChange("identification", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ""}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia</Label>
                    <Input
                      id="province"
                      value={formData.province || ""}
                      onChange={(e) =>
                        handleInputChange("province", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employmentIncome">
                      Rendimientos del trabajo (€)
                    </Label>
                    <Input
                      id="employmentIncome"
                      value={formData.employmentIncome || ""}
                      onChange={(e) =>
                        handleInputChange("employmentIncome", e.target.value)
                      }
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selfEmploymentIncome">
                      Actividades económicas (€)
                    </Label>
                    <Input
                      id="selfEmploymentIncome"
                      value={formData.selfEmploymentIncome || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "selfEmploymentIncome",
                          e.target.value
                        )
                      }
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capitalGains">
                      Ganancias patrimoniales (€)
                    </Label>
                    <Input
                      id="capitalGains"
                      value={formData.capitalGains || ""}
                      onChange={(e) =>
                        handleInputChange("capitalGains", e.target.value)
                      }
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherIncome">Otros ingresos (€)</Label>
                    <Input
                      id="otherIncome"
                      value={formData.otherIncome || ""}
                      onChange={(e) =>
                        handleInputChange("otherIncome", e.target.value)
                      }
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deductions">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="housingDeduction">
                      Deducción vivienda (€)
                    </Label>
                    <Input
                      id="housingDeduction"
                      value={formData.housingDeduction || ""}
                      onChange={(e) =>
                        handleInputChange("housingDeduction", e.target.value)
                      }
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pensionContributions">
                      Aportaciones a planes de pensiones (€)
                    </Label>
                    <Input
                      id="pensionContributions"
                      value={formData.pensionContributions || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "pensionContributions",
                          e.target.value
                        )
                      }
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="charitableDonations">Donativos (€)</Label>
                    <Input
                      id="charitableDonations"
                      value={formData.charitableDonations || ""}
                      onChange={(e) =>
                        handleInputChange("charitableDonations", e.target.value)
                      }
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherDeductions">
                      Otras deducciones (€)
                    </Label>
                    <Input
                      id="otherDeductions"
                      value={formData.otherDeductions || ""}
                      onChange={(e) =>
                        handleInputChange("otherDeductions", e.target.value)
                      }
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="ml-2"
          >
            {isGeneratingPDF ? "Generando..." : "Generar PDF"}
          </Button>
        </div>
      </main>
    </div>
  );
}
