import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  AlertCircle,
  Bell,
  Check,
  Database,
  FileText,
  Key,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";

// UI Components - using relative imports
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

// Define interface for admin users
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
}

// Define interface for system settings
interface SystemSettings {
  // General settings
  siteName: string;
  contactEmail: string;
  maintenanceMode: boolean;

  // API settings
  openaiApiKey: string;
  openaiModel: string;

  // Tax form settings
  defaultTaxYear: number;
  activeForms: string[];
  testMode: boolean;

  // User settings
  requireEmailVerification: boolean;
  allowGoogleLogin: boolean;
  allowAccountDeletion: boolean;

  // Notification settings
  adminNotificationsEmail: string;
  sendUserCompletionEmails: boolean;
  notificationEmailSubject: string;
  emailTemplate: string;
}

// Define a type for the values that can be assigned to settings fields
type SettingValue = string | number | boolean | string[];

const AdminSettings: React.FC = () => {
  // State variables
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SystemSettings>({
    // General settings with defaults
    siteName: "Asistente Fiscal",
    contactEmail: "contact@asistente-fiscal.es",
    maintenanceMode: false,

    // API settings
    openaiApiKey: "",
    openaiModel: "gpt-4",

    // Tax form settings
    defaultTaxYear: new Date().getFullYear() - 1,
    activeForms: ["modelo-100"],
    testMode: false,

    // User settings
    requireEmailVerification: true,
    allowGoogleLogin: true,
    allowAccountDeletion: true,

    // Notification settings
    adminNotificationsEmail: "admin@asistente-fiscal.es",
    sendUserCompletionEmails: true,
    notificationEmailSubject:
      "Su declaración fiscal está lista - Asistente Fiscal",
    emailTemplate:
      "Estimado/a {nombre},\n\nSu declaración fiscal ha sido completada exitosamente.\n\nPuede descargar su PDF desde nuestro portal.\n\nGracias por usar nuestro servicio.\n\nEquipo de Asistente Fiscal",
  });

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");

  // Fetch settings and admin users on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const settingsDoc = await getDoc(doc(db, "systemSettings", "config"));

        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as SystemSettings;
          setSettings({
            ...settings,
            ...data,
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError(
          "Error al cargar la configuración. Por favor, inténtelo de nuevo."
        );
        setIsLoading(false);
      }
    };

    const fetchAdminUsers = async () => {
      try {
        const adminsCollection = collection(db, "adminUsers");
        const querySnapshot = await getDocs(adminsCollection);
        const adminsList: AdminUser[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          adminsList.push({
            id: doc.id,
            email: data.email || "",
            name: data.name || "",
            role: data.role || "admin",
            status: data.status || "active",
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });

        setAdminUsers(adminsList);
      } catch (err) {
        console.error("Error fetching admin users:", err);
      }
    };

    fetchSettings();
    fetchAdminUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle settings changes
  const handleSettingChange = (
    section: string,
    field: string,
    value: SettingValue
  ) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  // Save settings to Firestore
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await updateDoc(doc(db, "systemSettings", "config"), {
        ...settings,
        updatedAt: new Date(),
        updatedBy: "admin", // Would be the actual admin user ID in production
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success("Configuración guardada correctamente");
      setIsLoading(false);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(
        "Error al guardar la configuración. Por favor, inténtelo de nuevo."
      );
      setIsLoading(false);
      toast.error("Error al guardar la configuración");
    }
  };

  // Add new admin user
  const handleAddAdminUser = async () => {
    if (!newAdminEmail || !newAdminName) {
      toast.error("Por favor, complete todos los campos");
      return;
    }

    // In a real implementation, this would typically:
    // 1. Create a new user with admin privileges
    // 2. Send an invitation email
    // 3. Update the adminUsers collection
    // For this demo, we'll just show a success message

    toast.success(`Se ha enviado una invitación a ${newAdminEmail}`);

    // Reset form fields
    setNewAdminEmail("");
    setNewAdminName("");
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Configuración del Sistema</h1>
          <p className="text-gray-500">
            Gestione los ajustes de la aplicación y la configuración de
            administración
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Guardado
            </div>
          )}
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-3" />
            <span>Guardando configuración...</span>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Settings tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Formularios
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Administradores
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configure los ajustes básicos de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Nombre del Sitio</FormLabel>
                    <FormControl>
                      <Input
                        value={settings.siteName}
                        onChange={(e) =>
                          handleSettingChange(
                            "general",
                            "siteName",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      El nombre que aparecerá en el sitio y en los correos
                    </FormDescription>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Correo de Contacto</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) =>
                          handleSettingChange(
                            "general",
                            "contactEmail",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Correo electrónico para contacto desde el sitio
                    </FormDescription>
                  </FormItem>
                </div>

                <div className="space-y-4">
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Modo Mantenimiento</FormLabel>
                        <FormDescription>
                          Activa el modo de mantenimiento para todos los
                          usuarios
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "general",
                              "maintenanceMode",
                              checked
                            )
                          }
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de API</CardTitle>
              <CardDescription>
                Configure las claves y ajustes de la API de OpenAI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Clave API de OpenAI</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      value={settings.openaiApiKey}
                      onChange={(e) =>
                        handleSettingChange(
                          "api",
                          "openaiApiKey",
                          e.target.value
                        )
                      }
                      placeholder="sk-..."
                    />
                  </FormControl>
                  <FormDescription>
                    Clave API para conectar con los servicios de OpenAI
                  </FormDescription>
                </FormItem>

                <FormItem>
                  <FormLabel>Modelo de OpenAI</FormLabel>
                  <Select
                    value={settings.openaiModel}
                    onValueChange={(value) =>
                      handleSettingChange("api", "openaiModel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Modelo a utilizar para el asistente de IA
                  </FormDescription>
                </FormItem>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Settings Tab */}
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Formularios</CardTitle>
              <CardDescription>
                Configure los ajustes relacionados con los formularios fiscales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Año Fiscal por Defecto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={settings.defaultTaxYear}
                        onChange={(e) =>
                          handleSettingChange(
                            "forms",
                            "defaultTaxYear",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Año fiscal predeterminado para las declaraciones
                    </FormDescription>
                  </FormItem>

                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Modo de Prueba</FormLabel>
                        <FormDescription>
                          Active para mostrar datos de ejemplo y desactivar
                          envíos reales
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={settings.testMode}
                          onCheckedChange={(checked) =>
                            handleSettingChange("forms", "testMode", checked)
                          }
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                </div>

                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Formularios Activos</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="modelo-100"
                          checked={settings.activeForms.includes("modelo-100")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSettingChange("forms", "activeForms", [
                                ...settings.activeForms,
                                "modelo-100",
                              ]);
                            } else {
                              handleSettingChange(
                                "forms",
                                "activeForms",
                                settings.activeForms.filter(
                                  (form) => form !== "modelo-100"
                                )
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor="modelo-100"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Modelo 100 (IRPF)
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="modelo-303"
                          checked={settings.activeForms.includes("modelo-303")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSettingChange("forms", "activeForms", [
                                ...settings.activeForms,
                                "modelo-303",
                              ]);
                            } else {
                              handleSettingChange(
                                "forms",
                                "activeForms",
                                settings.activeForms.filter(
                                  (form) => form !== "modelo-303"
                                )
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor="modelo-303"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Modelo 303 (IVA)
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="modelo-200"
                          checked={settings.activeForms.includes("modelo-200")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSettingChange("forms", "activeForms", [
                                ...settings.activeForms,
                                "modelo-200",
                              ]);
                            } else {
                              handleSettingChange(
                                "forms",
                                "activeForms",
                                settings.activeForms.filter(
                                  (form) => form !== "modelo-200"
                                )
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor="modelo-200"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Modelo 200 (Impuesto de Sociedades)
                        </label>
                      </div>
                    </div>
                  </FormItem>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Settings Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Usuarios</CardTitle>
              <CardDescription>
                Gestione las políticas de usuarios y opciones de acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Requerir Verificación por Email</FormLabel>
                      <FormDescription>
                        Los usuarios deben verificar su correo antes de usar la
                        aplicación
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.requireEmailVerification}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "users",
                            "requireEmailVerification",
                            checked
                          )
                        }
                      />
                    </FormControl>
                  </div>
                </FormItem>

                <FormItem>
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>
                        Permitir Inicio de Sesión con Google
                      </FormLabel>
                      <FormDescription>
                        Permitir a los usuarios iniciar sesión con sus cuentas
                        de Google
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.allowGoogleLogin}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "users",
                            "allowGoogleLogin",
                            checked
                          )
                        }
                      />
                    </FormControl>
                  </div>
                </FormItem>

                <FormItem>
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Permitir Eliminación de Cuenta</FormLabel>
                      <FormDescription>
                        Permitir a los usuarios eliminar sus cuentas y datos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.allowAccountDeletion}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "users",
                            "allowAccountDeletion",
                            checked
                          )
                        }
                      />
                    </FormControl>
                  </div>
                </FormItem>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Configure las notificaciones por correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Correo para Notificaciones de Admin</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        value={settings.adminNotificationsEmail}
                        onChange={(e) =>
                          handleSettingChange(
                            "notifications",
                            "adminNotificationsEmail",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Correo que recibirá las notificaciones del sistema
                    </FormDescription>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Asunto del Correo</FormLabel>
                    <FormControl>
                      <Input
                        value={settings.notificationEmailSubject}
                        onChange={(e) =>
                          handleSettingChange(
                            "notifications",
                            "notificationEmailSubject",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Asunto para los correos de finalización
                    </FormDescription>
                  </FormItem>
                </div>

                <div className="space-y-4">
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Enviar Correos de Finalización</FormLabel>
                        <FormDescription>
                          Enviar correos a usuarios cuando completan una
                          declaración
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={settings.sendUserCompletionEmails}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "notifications",
                              "sendUserCompletionEmails",
                              checked
                            )
                          }
                        />
                      </FormControl>
                    </div>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Plantilla de Correo</FormLabel>
                    <FormControl>
                      <Textarea
                        value={settings.emailTemplate}
                        onChange={(e) =>
                          handleSettingChange(
                            "notifications",
                            "emailTemplate",
                            e.target.value
                          )
                        }
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Puede usar {"{nombre}"}, {"{fecha}"}, y {"{enlace}"} como
                      variables
                    </FormDescription>
                  </FormItem>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admins Management Tab */}
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Administradores</CardTitle>
              <CardDescription>
                Administre los accesos y permisos de administradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col space-y-4">
                  <h3 className="text-lg font-medium">
                    Administradores Actuales
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Correo Electrónico</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha de Creación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.length > 0 ? (
                          adminUsers.map((admin) => (
                            <TableRow key={admin.id}>
                              <TableCell>{admin.name}</TableCell>
                              <TableCell>{admin.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {admin.role === "superadmin"
                                    ? "Super Admin"
                                    : "Administrador"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    admin.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {admin.status === "active"
                                    ? "Activo"
                                    : "Inactivo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(admin.createdAt, "dd/MM/yyyy", {
                                  locale: es,
                                })}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-4 text-gray-500"
                            >
                              No hay administradores registrados
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Añadir Nuevo Administrador
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="Nombre del administrador"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                  <Button
                    onClick={handleAddAdminUser}
                    disabled={!newAdminEmail || !newAdminName}
                    className="mt-2"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Invitar Administrador
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
