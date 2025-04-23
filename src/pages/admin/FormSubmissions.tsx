import { format } from "date-fns";
import { es } from "date-fns/locale";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ArrowUpDown, Download, FileText, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { db } from "../../lib/firebase";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";

// Define submission status types and colors
const STATUS_TYPES = {
  completed: { label: "Completado", color: "bg-green-100 text-green-800" },
  "in-progress": { label: "En progreso", color: "bg-blue-100 text-blue-800" },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  error: { label: "Error", color: "bg-red-100 text-red-800" },
};

// Define submission form types
const FORM_TYPES = {
  "modelo-100": { label: "Modelo 100 (IRPF)" },
  "modelo-303": { label: "Modelo 303 (IVA)" },
  "modelo-200": { label: "Modelo 200 (Impuesto de Sociedades)" },
};

interface SubmissionData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  formType: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  taxYear: number;
  isPdfGenerated: boolean;
  metadata: {
    dni?: string;
    nie?: string;
    totalIncome?: number;
    totalDeductions?: number;
    resultAmount?: number;
  };
}

const FormSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    SubmissionData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const submissionsCollection = collection(db, "submissions");
        const submissionsQuery = query(
          submissionsCollection,
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(submissionsQuery);
        const submissionsList: SubmissionData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          submissionsList.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName || "Usuario",
            userEmail: data.userEmail || "No disponible",
            formType: data.formType || "modelo-100",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            status: data.status || "pending",
            taxYear: data.taxYear || new Date().getFullYear() - 1,
            isPdfGenerated: data.isPdfGenerated || false,
            metadata: data.metadata || {},
          });
        });

        setSubmissions(submissionsList);
        setFilteredSubmissions(submissionsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(
          "Error al cargar las declaraciones. Por favor, inténtelo de nuevo."
        );
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = [...submissions];

    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (submission) =>
          submission.userName.toLowerCase().includes(lowerSearchTerm) ||
          submission.userEmail.toLowerCase().includes(lowerSearchTerm) ||
          (submission.metadata.dni &&
            submission.metadata.dni.toLowerCase().includes(lowerSearchTerm)) ||
          (submission.metadata.nie &&
            submission.metadata.nie.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(
        (submission) => submission.status === statusFilter
      );
    }

    // Apply form type filter
    if (formTypeFilter !== "all") {
      results = results.filter(
        (submission) => submission.formType === formTypeFilter
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      const fieldA =
        sortBy.field === "createdAt"
          ? a.createdAt
          : sortBy.field === "updatedAt"
          ? a.updatedAt
          : sortBy.field === "userName"
          ? a.userName
          : a.status;

      const fieldB =
        sortBy.field === "createdAt"
          ? b.createdAt
          : sortBy.field === "updatedAt"
          ? b.updatedAt
          : sortBy.field === "userName"
          ? b.userName
          : b.status;

      if (sortBy.field === "userName") {
        return sortBy.direction === "asc"
          ? (fieldA as string).localeCompare(fieldB as string)
          : typeof fieldB === "string" && typeof fieldA === "string"
          ? fieldB.localeCompare(fieldA)
          : 0;
      } else if (sortBy.field === "status") {
        return sortBy.direction === "asc"
          ? (fieldA as string).localeCompare(fieldB as string)
          : typeof fieldB === "string" && typeof fieldA === "string"
          ? fieldB.localeCompare(fieldA)
          : 0;
      } else {
        // Date comparison
        const dateA = fieldA as Date;
        const dateB = fieldB as Date;
        return sortBy.direction === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });

    setFilteredSubmissions(results);
  }, [submissions, searchTerm, statusFilter, formTypeFilter, sortBy]);

  const handleSort = (field: string) => {
    setSortBy({
      field,
      direction:
        sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc",
    });
  };

  const exportToCsv = () => {
    // Create CSV header
    const headers = [
      "ID",
      "Usuario",
      "Correo",
      "DNI/NIE",
      "Tipo de Declaración",
      "Año Fiscal",
      "Fecha Creación",
      "Última Actualización",
      "Estado",
      "PDF Generado",
      "Ingresos Totales",
      "Deducciones",
      "Resultado",
    ].join(",");

    // Create CSV rows
    const rows = filteredSubmissions.map((submission) =>
      [
        submission.id,
        submission.userName,
        submission.userEmail,
        submission.metadata.dni || submission.metadata.nie || "",
        FORM_TYPES[submission.formType as keyof typeof FORM_TYPES]?.label ||
          submission.formType,
        submission.taxYear,
        format(submission.createdAt, "dd/MM/yyyy HH:mm"),
        format(submission.updatedAt, "dd/MM/yyyy HH:mm"),
        STATUS_TYPES[submission.status as keyof typeof STATUS_TYPES]?.label ||
          submission.status,
        submission.isPdfGenerated ? "Sí" : "No",
        submission.metadata.totalIncome || "",
        submission.metadata.totalDeductions || "",
        submission.metadata.resultAmount || "",
      ].join(",")
    );

    // Combine header and rows
    const csv = [headers, ...rows].join("\n");

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `declaraciones_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Declaraciones Presentadas
              </CardTitle>
              <CardDescription>
                Gestione y revise todas las declaraciones fiscales enviadas por
                los usuarios
              </CardDescription>
            </div>
            <Button onClick={exportToCsv} className="flex items-center gap-2">
              <Download size={16} />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre, email, DNI/NIE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(STATUS_TYPES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por formulario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los modelos</SelectItem>
                  {Object.entries(FORM_TYPES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loader"></div>
              <span className="ml-3">Cargando declaraciones...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No se encontraron declaraciones que coincidan con los filtros
              aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("userName")}
                      >
                        Usuario
                        <ArrowUpDown size={16} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>DNI/NIE</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Año Fiscal</TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("createdAt")}
                      >
                        Fecha
                        <ArrowUpDown size={16} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        Estado
                        <ArrowUpDown size={16} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-xs">
                        {submission.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {submission.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.metadata.dni ||
                          submission.metadata.nie ||
                          "—"}
                      </TableCell>
                      <TableCell>
                        {FORM_TYPES[
                          submission.formType as keyof typeof FORM_TYPES
                        ]?.label || submission.formType}
                      </TableCell>
                      <TableCell>{submission.taxYear}</TableCell>
                      <TableCell>
                        {format(submission.createdAt, "dd MMM yyyy", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            STATUS_TYPES[
                              submission.status as keyof typeof STATUS_TYPES
                            ]?.color || "bg-gray-100 text-gray-800"
                          }
                        >
                          {STATUS_TYPES[
                            submission.status as keyof typeof STATUS_TYPES
                          ]?.label || submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FileText size={16} />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                            {submission.isPdfGenerated && (
                              <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              Enviar recordatorio
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSubmissions;
