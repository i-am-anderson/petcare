import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Employee } from "../types";
import { CheckInRecord } from "./CheckIn";
import {
  ClipboardList,
  Play,
  CheckCircle,
  Clock,
  PawPrint,
  User,
  Scissors,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/ui/pagination";

const PAGE_SIZE = 10;

export interface ServiceOrder {
  id: string;
  checkInId: string;
  petId: string;
  petName: string;
  clientName: string;
  service: string;
  employeeId: string;
  employeeName: string;
  startTime?: string;
  endTime?: string;
  status: "pending" | "in_progress" | "completed";
  internalNotes: string;
  createdAt: string;
}

const SERVICE_PRICES: Record<string, number> = {
  Banho: 60,
  Tosa: 80,
  "Banho e Tosa": 120,
  Hidratação: 50,
  "Corte de Unhas": 30,
};

export function ServiceOrderPage() {
  const [checkIns, setCheckIns] = useLocalStorage<CheckInRecord[]>(
    "checkIns",
    [],
  );
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [serviceOrders, setServiceOrders] = useLocalStorage<ServiceOrder[]>(
    "serviceOrders",
    [],
  );

  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);

  const waitingCheckIns = useMemo(() => {
    return checkIns.filter((ci) => ci.status === "waiting");
  }, [checkIns]);

  const activeOrders = useMemo(() => {
    return serviceOrders.filter((so) => so.status === "in_progress");
  }, [serviceOrders]);

  const completedToday = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return serviceOrders.filter(
      (so) => so.status === "completed" && so.endTime?.startsWith(today),
    );
  }, [serviceOrders]);

  const completedPagination = usePagination(completedToday, PAGE_SIZE);

  const handleStartService = (checkIn: CheckInRecord) => {
    const existing = serviceOrders.find((so) => so.checkInId === checkIn.id);
    if (existing) return;

    const newOrder: ServiceOrder = {
      id: crypto.randomUUID(),
      checkInId: checkIn.id,
      petId: checkIn.petId,
      petName: checkIn.petName,
      clientName: checkIn.clientName,
      service: checkIn.service,
      employeeId: checkIn.employeeId,
      employeeName: checkIn.employeeName,
      startTime: new Date().toISOString(),
      status: "in_progress",
      internalNotes: "",
      createdAt: new Date().toISOString(),
    };

    setServiceOrders([...serviceOrders, newOrder]);
    setCheckIns(
      checkIns.map((ci) =>
        ci.id === checkIn.id ? { ...ci, status: "in_service" } : ci,
      ),
    );
  };

  const handleCompleteService = (order: ServiceOrder) => {
    setServiceOrders(
      serviceOrders.map((so) =>
        so.id === order.id
          ? { ...so, status: "completed", endTime: new Date().toISOString() }
          : so,
      ),
    );
    setCheckIns(
      checkIns.map((ci) =>
        ci.id === order.checkInId ? { ...ci, status: "done" } : ci,
      ),
    );
  };

  const handleSaveNotes = () => {
    if (!selectedOrder) return;
    setServiceOrders(
      serviceOrders.map((so) =>
        so.id === selectedOrder.id ? { ...so, internalNotes: notesInput } : so,
      ),
    );
    setShowNotesModal(false);
  };

  const getElapsedTime = (startTime: string | undefined) => {
    if (!startTime) return "—";

    const parsedDate = parseISO(startTime);

    // Verifica se a data é válida antes de calcular
    if (isNaN(parsedDate.getTime())) return "—";

    const mins = differenceInMinutes(new Date(), parsedDate);
    if (mins < 0) return "0min"; // Previne tempo negativo caso o sistema tenha horários inconsistentes
    if (mins < 60) return `${mins}min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  const statusColor = (status: ServiceOrder["status"]) => {
    if (status === "in_progress") return "bg-blue-100 text-blue-800";
    if (status === "completed") return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Ordem de Serviço</h1>
        <p className="text-slate-600 mt-1">
          Gerencie os atendimentos em andamento
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Aguardando</p>
              <p className="text-2xl font-bold text-slate-900">
                {waitingCheckIns.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Scissors className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Em Atendimento</p>
              <p className="text-2xl font-bold text-slate-900">
                {activeOrders.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Concluídos Hoje</p>
              <p className="text-2xl font-bold text-slate-900">
                {completedToday.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Queue */}
      {waitingCheckIns.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Fila de Espera
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {waitingCheckIns.map((ci) => (
              <div
                key={ci.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <PawPrint className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{ci.petName}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ci.clientName}
                      </span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {ci.service}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ci.employeeName}
                      </span>
                    </div>
                    {ci.observations && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-0.5 mt-1 inline-flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {ci.observations}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleStartService(ci)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  <Play className="h-4 w-4" />
                  Iniciar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Service Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Em Atendimento
          </h2>
        </div>
        {activeOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhum atendimento em andamento
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="border border-blue-200 rounded-lg p-4 bg-blue-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">
                      {order.petName}
                    </p>
                    <p className="text-sm text-slate-600">{order.clientName}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    Em serviço
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 mb-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">
                      Serviço
                    </p>
                    <p className="font-semibold">{order.service}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">
                      Funcionário
                    </p>
                    <p className="font-semibold">{order.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">
                      Iniciado às
                    </p>
                    <p className="font-semibold">
                      {order.startTime &&
                      !isNaN(parseISO(order.startTime).getTime())
                        ? format(parseISO(order.startTime), "HH:mm")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">
                      Tempo decorrido
                    </p>
                    <p className="font-semibold text-blue-700">
                      {getElapsedTime(order.startTime)}
                    </p>
                  </div>
                </div>

                {order.internalNotes && (
                  <p className="text-xs text-slate-600 bg-white rounded px-2 py-1.5 mb-3 border border-slate-200">
                    📝 {order.internalNotes}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCompleteService(order)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Concluir
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setNotesInput(order.internalNotes);
                      setShowNotesModal(true);
                    }}
                    className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm"
                  >
                    📝 Obs.
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Concluídos Hoje
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Pet / Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Início / Fim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {completedPagination.paginatedItems.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {order.petName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.clientName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {order.service}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {order.employeeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.startTime &&
                      !isNaN(parseISO(order.startTime).getTime())
                        ? format(parseISO(order.startTime), "HH:mm")
                        : "—"}
                      {" → "}
                      {order.endTime &&
                      !isNaN(parseISO(order.endTime).getTime())
                        ? format(parseISO(order.endTime), "HH:mm")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-700">
                      R$ {(SERVICE_PRICES[order.service] || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            {...completedPagination}
            onPageChange={completedPagination.goToPage}
          />
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedOrder && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Observações — {selectedOrder.petName}
            </h2>
            <textarea
              rows={4}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Anotações internas do serviço..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveNotes}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
