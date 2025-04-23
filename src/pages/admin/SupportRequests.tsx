import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  MessageCircle,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

// Define support ticket status types and colors
const TICKET_STATUS = {
  new: { label: "Nuevo", color: "bg-blue-100 text-blue-800" },
  "in-progress": {
    label: "En proceso",
    color: "bg-yellow-100 text-yellow-800",
  },
  resolved: { label: "Resuelto", color: "bg-green-100 text-green-800" },
  closed: { label: "Cerrado", color: "bg-gray-100 text-gray-800" },
};

// Define support ticket categories
const TICKET_CATEGORIES = {
  technical: { label: "Problema técnico" },
  account: { label: "Cuenta de usuario" },
  "tax-question": { label: "Consulta fiscal" },
  "form-help": { label: "Ayuda con formulario" },
  other: { label: "Otro" },
};

// Define support ticket priority levels
const TICKET_PRIORITIES = {
  low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Media", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Alta", color: "bg-red-100 text-red-800" },
};

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  responses: {
    id: string;
    author: string;
    isAdmin: boolean;
    content: string;
    createdAt: Date;
  }[];
}

const SupportRequests: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "createdAt",
    direction: "desc",
  });

  // For dialog response form
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [responseContent, setResponseContent] = useState<string>("");
  const [showResponseForm, setShowResponseForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const ticketsCollection = collection(db, "supportTickets");
        const ticketsQuery = query(
          ticketsCollection,
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(ticketsQuery);
        const ticketsList: SupportTicket[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ticketsList.push({
            id: doc.id,
            userId: data.userId || "",
            userName: data.userName || "Usuario",
            userEmail: data.userEmail || "No disponible",
            subject: data.subject || "",
            description: data.description || "",
            category: data.category || "other",
            status: data.status || "new",
            priority: data.priority || "medium",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            assignedTo: data.assignedTo || undefined,
            responses: (data.responses || []).map(
              (response: {
                id: string;
                author: string;
                isAdmin: boolean;
                content: string;
                createdAt: import("firebase/firestore").Timestamp;
              }) => ({
                ...response,
                createdAt: response.createdAt?.toDate() || new Date(),
              })
            ),
          });
        });

        setTickets(ticketsList);
        setFilteredTickets(ticketsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching support tickets:", err);
        setError(
          "Error al cargar las solicitudes de soporte. Por favor, inténtelo de nuevo."
        );
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    // Apply filters, search, and tab selection
    let results = [...tickets];

    // Apply tab filter
    if (currentTab === "new") {
      results = results.filter((ticket) => ticket.status === "new");
    } else if (currentTab === "in-progress") {
      results = results.filter((ticket) => ticket.status === "in-progress");
    } else if (currentTab === "resolved") {
      results = results.filter(
        (ticket) => ticket.status === "resolved" || ticket.status === "closed"
      );
    }

    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(lowerSearchTerm) ||
          ticket.description.toLowerCase().includes(lowerSearchTerm) ||
          ticket.userName.toLowerCase().includes(lowerSearchTerm) ||
          ticket.userEmail.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter((ticket) => ticket.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      results = results.filter((ticket) => ticket.category === categoryFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      results = results.filter((ticket) => ticket.priority === priorityFilter);
    }

    // Apply sorting
    results.sort((a, b) => {
      const fieldA =
        sortBy.field === "createdAt"
          ? a.createdAt
          : sortBy.field === "updatedAt"
          ? a.updatedAt
          : sortBy.field === "priority"
          ? a.priority
          : a.subject;

      const fieldB =
        sortBy.field === "createdAt"
          ? b.createdAt
          : sortBy.field === "updatedAt"
          ? b.updatedAt
          : sortBy.field === "priority"
          ? b.priority
          : b.subject;

      if (sortBy.field === "subject") {
        return sortBy.direction === "asc"
          ? (fieldA as string).localeCompare(fieldB as string)
          : (fieldB as string).localeCompare(fieldA as string);
      } else if (sortBy.field === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const orderA = priorityOrder[fieldA as keyof typeof priorityOrder] || 0;
        const orderB = priorityOrder[fieldB as keyof typeof priorityOrder] || 0;
        return sortBy.direction === "asc" ? orderA - orderB : orderB - orderA;
      } else {
        // Date comparison
        const dateA = fieldA as Date;
        const dateB = fieldB as Date;
        return sortBy.direction === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });

    setFilteredTickets(results);
  }, [
    tickets,
    searchTerm,
    statusFilter,
    categoryFilter,
    priorityFilter,
    currentTab,
    sortBy,
  ]);

  const handleSort = (field: string) => {
    setSortBy({
      field,
      direction:
        sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc",
    });
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResponseContent("");
    setShowResponseForm(false);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
    setResponseContent("");
    setShowResponseForm(false);
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const ticketRef = doc(db, "supportTickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      const updatedTickets = tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status: newStatus,
            updatedAt: new Date(),
          };
        }
        return ticket;
      });

      setTickets(updatedTickets);

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: newStatus,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
      setError("Error al actualizar el estado. Por favor, inténtelo de nuevo.");
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedTicket || !responseContent.trim()) return;

    try {
      setIsSubmitting(true);

      const newResponse = {
        id: `resp_${Date.now()}`,
        author: "Administrador", // This would be the admin's name in a real app
        isAdmin: true,
        content: responseContent,
        createdAt: new Date(),
      };

      const ticketRef = doc(db, "supportTickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        status: "in-progress",
        updatedAt: new Date(),
        responses: [...selectedTicket.responses, newResponse],
      });

      // Update local state
      const updatedTickets = tickets.map((ticket) => {
        if (ticket.id === selectedTicket.id) {
          return {
            ...ticket,
            status: "in-progress",
            updatedAt: new Date(),
            responses: [...ticket.responses, newResponse],
          };
        }
        return ticket;
      });

      setTickets(updatedTickets);
      setSelectedTicket({
        ...selectedTicket,
        status: "in-progress",
        updatedAt: new Date(),
        responses: [...selectedTicket.responses, newResponse],
      });

      setResponseContent("");
      setShowResponseForm(false);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Error submitting response:", err);
      setError("Error al enviar la respuesta. Por favor, inténtelo de nuevo.");
      setIsSubmitting(false);
    }
  };

  const getTabCounts = () => {
    const counts = {
      all: tickets.length,
      new: tickets.filter((ticket) => ticket.status === "new").length,
      "in-progress": tickets.filter((ticket) => ticket.status === "in-progress")
        .length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "resolved" || ticket.status === "closed"
      ).length,
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Solicitudes de Soporte</h1>
            <p className="text-gray-500">
              Gestione las consultas y problemas reportados por los usuarios
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="all">
              Todos{" "}
              <Badge variant="secondary" className="ml-2">
                {tabCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="new">
              Nuevos{" "}
              <Badge variant="secondary" className="ml-2">
                {tabCounts.new}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              En proceso{" "}
              <Badge variant="secondary" className="ml-2">
                {tabCounts["in-progress"]}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resueltos{" "}
              <Badge variant="secondary" className="ml-2">
                {tabCounts.resolved}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar por asunto, descripción o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {Object.entries(TICKET_STATUS).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(TICKET_CATEGORIES).map(
                      ([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    {Object.entries(TICKET_PRIORITIES).map(
                      ([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all">{renderTicketsTable()}</TabsContent>
            <TabsContent value="new">{renderTicketsTable()}</TabsContent>
            <TabsContent value="in-progress">
              {renderTicketsTable()}
            </TabsContent>
            <TabsContent value="resolved">{renderTicketsTable()}</TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && handleCloseTicket()}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">
                    {selectedTicket.subject}
                  </DialogTitle>
                  <div className="flex gap-2">
                    <Badge
                      className={
                        TICKET_PRIORITIES[
                          selectedTicket.priority as keyof typeof TICKET_PRIORITIES
                        ]?.color || "bg-gray-100 text-gray-800"
                      }
                    >
                      {TICKET_PRIORITIES[
                        selectedTicket.priority as keyof typeof TICKET_PRIORITIES
                      ]?.label || selectedTicket.priority}
                    </Badge>
                    <Badge
                      className={
                        TICKET_STATUS[
                          selectedTicket.status as keyof typeof TICKET_STATUS
                        ]?.color || "bg-gray-100 text-gray-800"
                      }
                    >
                      {TICKET_STATUS[
                        selectedTicket.status as keyof typeof TICKET_STATUS
                      ]?.label || selectedTicket.status}
                    </Badge>
                  </div>
                </div>
                <DialogDescription className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex items-center">
                      <User size={16} className="mr-1" />
                      <span>
                        {selectedTicket.userName} ({selectedTicket.userEmail})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>
                        {format(selectedTicket.createdAt, "dd MMM yyyy HH:mm", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Categoría:</span>{" "}
                    {TICKET_CATEGORIES[
                      selectedTicket.category as keyof typeof TICKET_CATEGORIES
                    ]?.label || selectedTicket.category}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-4">Historial de Comunicación</h3>

                {selectedTicket.responses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTicket.responses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-3 rounded-md ${
                          response.isAdmin
                            ? "bg-blue-50 ml-8"
                            : "bg-gray-50 mr-8"
                        }`}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{response.author}</span>
                          <span className="text-gray-500">
                            {format(response.createdAt, "dd MMM yyyy HH:mm", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">
                          {response.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No hay respuestas todavía.
                  </div>
                )}
              </div>

              {!showResponseForm ? (
                <div className="flex flex-row gap-2 mt-4">
                  <Button
                    onClick={() => setShowResponseForm(true)}
                    className="flex-1"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Responder
                  </Button>

                  {selectedTicket.status !== "resolved" && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        handleUpdateStatus(selectedTicket.id, "resolved")
                      }
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      Marcar como Resuelto
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <textarea
                    placeholder="Escriba su respuesta aquí..."
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    rows={5}
                    className="mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowResponseForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmitResponse}
                      disabled={!responseContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderTicketsTable() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="loader"></div>
          <span className="ml-3">Cargando solicitudes...</span>
        </div>
      );
    }

    if (filteredTickets.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No se encontraron solicitudes que coincidan con los filtros aplicados.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("subject")}
                >
                  Asunto
                  <ArrowUpDown size={16} className="ml-1" />
                </div>
              </TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("priority")}
                >
                  Prioridad
                  <ArrowUpDown size={16} className="ml-1" />
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Fecha
                  <ArrowUpDown size={16} className="ml-1" />
                </div>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Respuestas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleViewTicket(ticket)}
              >
                <TableCell className="font-medium">
                  <div
                    className="truncate max-w-[300px]"
                    title={ticket.subject}
                  >
                    {ticket.subject}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="truncate max-w-[150px]"
                    title={ticket.userName}
                  >
                    {ticket.userName}
                  </div>
                  <div
                    className="text-xs text-gray-500 truncate"
                    title={ticket.userEmail}
                  >
                    {ticket.userEmail}
                  </div>
                </TableCell>
                <TableCell>
                  {TICKET_CATEGORIES[
                    ticket.category as keyof typeof TICKET_CATEGORIES
                  ]?.label || ticket.category}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      TICKET_PRIORITIES[
                        ticket.priority as keyof typeof TICKET_PRIORITIES
                      ]?.color || "bg-gray-100 text-gray-800"
                    }
                  >
                    {TICKET_PRIORITIES[
                      ticket.priority as keyof typeof TICKET_PRIORITIES
                    ]?.label || ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    {format(ticket.createdAt, "dd/MM/yyyy", { locale: es })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(ticket.createdAt, {
                      addSuffix: true,
                      locale: es,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      TICKET_STATUS[ticket.status as keyof typeof TICKET_STATUS]
                        ?.color || "bg-gray-100 text-gray-800"
                    }
                  >
                    {TICKET_STATUS[ticket.status as keyof typeof TICKET_STATUS]
                      ?.label || ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticket.responses.length > 0 ? (
                    <div className="text-center">
                      <Badge variant="outline">{ticket.responses.length}</Badge>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 text-center">
                      Sin respuestas
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default SupportRequests;
