import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Download,
  FileText,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";

import NotFound from "../NotFound";
import AdminSettings from "./AdminSettings";
import FormSubmissions from "./FormSubmissions";
import SupportRequests from "./SupportRequests";
import UsersList from "./UsersList";

interface Stats {
  totalUsers: number;
  completedForms: number;
  activeUsers: number;
  totalSubmissions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    completedForms: 0,
    activeUsers: 0,
    totalSubmissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users collection
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        // Calculate other stats
        let completedForms = 0;
        let activeUsersLast30Days = 0;
        let totalSubmissions = 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();

          // Check if user has completed forms
          if (userData.formData && Object.keys(userData.formData).length > 0) {
            completedForms++;
          }

          // Check if user was active in last 30 days
          if (
            userData.lastActive &&
            userData.lastActive.toDate() > thirtyDaysAgo
          ) {
            activeUsersLast30Days++;
          }

          // Count submissions
          if (userData.submissions) {
            totalSubmissions += userData.submissions.length;
          }
        });

        setStats({
          totalUsers,
          completedForms,
          activeUsers: activeUsersLast30Days,
          totalSubmissions,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const exportUserData = () => {
    // Simple implementation of CSV export
    // In a real implementation, this would be more sophisticated
    alert("Exportando datos de usuarios...");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white h-screen sticky top-0">
          <div className="p-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-400">Asistente Fiscal</p>
          </div>

          <nav className="mt-6">
            <ul>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => navigate("/admin")}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => navigate("/admin/users")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Usuarios
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => navigate("/admin/submissions")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Declaraciones
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => navigate("/admin/support")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Soporte
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => navigate("/admin/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
              </li>
            </ul>
          </nav>

          <div className="absolute bottom-0 w-full p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-medium">Panel de Administración</h1>
                <Button onClick={exportUserData} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Exportar datos
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Usuarios
                          </CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stats.totalUsers}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Usuarios registrados
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Formul. Completados
                          </CardTitle>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stats.completedForms}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Declaraciones finalizadas
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Usuarios Activos
                          </CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stats.activeUsers}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Últimos 30 días
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            Declaraciones
                          </CardTitle>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {stats.totalSubmissions}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total presentadas
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent activity */}
                    <Tabs defaultValue="users">
                      <TabsList>
                        <TabsTrigger value="users">
                          Usuarios recientes
                        </TabsTrigger>
                        <TabsTrigger value="submissions">
                          Declaraciones recientes
                        </TabsTrigger>
                        <TabsTrigger value="support">
                          Soporte reciente
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="users" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              Usuarios registrados recientemente
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Cargando usuarios recientes...</p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="submissions" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Declaraciones recientes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Cargando declaraciones recientes...</p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="support" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              Solicitudes de soporte recientes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Cargando solicitudes de soporte recientes...</p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </>
                }
              />
              <Route path="/users" element={<UsersList />} />
              <Route path="/submissions" element={<FormSubmissions />} />
              <Route path="/support" element={<SupportRequests />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
