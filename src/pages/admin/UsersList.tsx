import { collection, getDocs } from "firebase/firestore";
import { Download, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { db } from "../../lib/firebase";

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastActive?: Date;
  formStatus?: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || "",
            displayName: data.displayName || data.firstName || "",
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            lastActive: data.lastActive ? data.lastActive.toDate() : undefined,
            formStatus: getFormStatus(data),
          };
        });

        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.displayName.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  interface UserData {
    formData?: Record<string, string | number | boolean | null>;
  }

  const getFormStatus = (userData: UserData): string => {
    if (!userData.formData) return "No iniciado";

    const formDataLength = Object.keys(userData.formData).length;
    if (formDataLength === 0) return "No iniciado";
    if (formDataLength < 5) return "Iniciado";
    if (formDataLength < 10) return "En progreso";
    return "Completado";
  };

  const exportUsers = () => {
    // Convert users to CSV
    const headers = [
      "ID",
      "Email",
      "Nombre",
      "Fecha de registro",
      "Última actividad",
      "Estado formulario",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.id,
          user.email,
          user.displayName,
          user.createdAt.toISOString().split("T")[0],
          user.lastActive ? user.lastActive.toISOString().split("T")[0] : "N/A",
          user.formStatus,
        ].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "usuarios_asistente_fiscal.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button onClick={exportUsers} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Fecha de registro</TableHead>
                <TableHead>Última actividad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.displayName || "Sin nombre"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.lastActive
                        ? user.lastActive.toLocaleDateString()
                        : "Nunca"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.formStatus === "Completado"
                            ? "bg-green-100 text-green-800"
                            : user.formStatus === "En progreso"
                            ? "bg-blue-100 text-blue-800"
                            : user.formStatus === "Iniciado"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.formStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
