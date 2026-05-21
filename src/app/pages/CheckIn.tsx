import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Appointment, Pet } from "../types";
import { LogIn, Search, Clock, PawPrint, User, AlertCircle, CheckCircle, ClipboardList } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface CheckInRecord {
  id: string;
  appointmentId: string;
  petId: string;
  petName: string;
  clientId: string;
  clientName: string;
  service: string;
  employeeId: string;
  employeeName: string;
  scheduledTime: string;
  checkInTime: string;
  observations: string;
  petCondition: "normal" | "agitated" | "shy" | "injured";
  status: "waiting" | "in_service" | "done" | "checked_out";
  date: string;
  createdAt: string;
}

export function CheckIn() {
  const [appointments] = useLocalStorage<Appointment[]>("appointments", []);
  const [pets] = useLocalStorage<Pet[]>("pets", []);
  const [checkIns, setCheckIns] = useLocalStorage<CheckInRecord[]>("checkIns", []);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    observations: "",
    petCondition: "normal" as CheckInRecord["petCondition"],
  });

  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.date);
      return isToday(aptDate) && apt.status === "scheduled";
    });
  }, [appointments]);

  const checkedInToday = useMemo(() => {
    return checkIns.filter((ci) => {
      const ciDate = parseISO(ci.date);
      return isToday(ciDate);
    });
  }, [checkIns]);

  const filteredAppointments = useMemo(() => {
    return todayAppointments.filter((apt) => {
      const alreadyCheckedIn = checkIns.some((ci) => ci.appointmentId === apt.id);
      if (alreadyCheckedIn) return false;
      if (!searchTerm) return true;
      return (
        apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [todayAppointments, checkIns, searchTerm]);

  const isCheckedIn = (appointmentId: string) =>
    checkIns.some((ci) => ci.appointmentId === appointmentId);

  const handleOpenModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setFormData({ observations: "", petCondition: "normal" });
    setShowModal(true);
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    const newCheckIn: CheckInRecord = {
      id: crypto.randomUUID(),
      appointmentId: selectedAppointment.id,
      petId: selectedAppointment.petId,
      petName: selectedAppointment.petName,
      clientId: selectedAppointment.clientId,
      clientName: selectedAppointment.clientName,
      service: selectedAppointment.service,
      employeeId: selectedAppointment.employeeId,
      employeeName: selectedAppointment.employeeName,
      scheduledTime: selectedAppointment.time,
      checkInTime: format(new Date(), "HH:mm"),
      observations: formData.observations,
      petCondition: formData.petCondition,
      status: "waiting",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setCheckIns([...checkIns, newCheckIn]);
    setShowModal(false);
  };

  const conditionLabels: Record<CheckInRecord["petCondition"], { label: string; color: string }> = {
    normal: { label: "Normal", color: "bg-green-100 text-green-800" },
    agitated: { label: "Agitado", color: "bg-yellow-100 text-yellow-800" },
    shy: { label: "Tímido", color: "bg-blue-100 text-blue-800" },
    injured: { label: "Machucado", color: "bg-red-100 text-red-800" },
  };

  const statusLabels: Record<CheckInRecord["status"], { label: string; color: string }> = {
    waiting: { label: "Aguardando", color: "bg-yellow-100 text-yellow-800" },
    in_service: { label: "Em Atendimento", color: "bg-blue-100 text-blue-800" },
    done: { label: "Pronto", color: "bg-green-100 text-green-800" },
    checked_out: { label: "Saiu", color: "bg-slate-100 text-slate-600" },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Check-in de Pets</h1>
        <p className="text-slate-600 mt-1">Registre a entrada dos pets agendados para hoje</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Agendados Hoje</p>
              <p className="text-2xl font-bold text-slate-900">{todayAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Check-ins Realizados</p>
              <p className="text-2xl font-bold text-slate-900">{checkedInToday.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Aguardando Check-in</p>
              <p className="text-2xl font-bold text-slate-900">{filteredAppointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending check-ins */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Aguardando Check-in</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pet ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {todayAppointments.length === 0
              ? "Nenhum agendamento para hoje"
              : "Todos os pets do dia já fizeram check-in"}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredAppointments.map((apt) => (
              <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-teal-100 rounded-full">
                    <PawPrint className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{apt.petName}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {apt.clientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {apt.time}
                      </span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {apt.service}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenModal(apt)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  Check-in
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's check-ins */}
      {checkedInToday.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Check-ins de Hoje</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pet / Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Condição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Obs.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {checkedInToday.map((ci) => (
                  <tr key={ci.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{ci.petName}</p>
                      <p className="text-sm text-slate-500">{ci.clientName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{ci.service}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500">Agendado: {ci.scheduledTime}</p>
                      <p className="text-sm font-medium text-teal-700">Entrada: {ci.checkInTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionLabels[ci.petCondition].color}`}>
                        {conditionLabels[ci.petCondition].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[ci.status].color}`}>
                        {statusLabels[ci.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {ci.observations || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Registrar Check-in</h2>
              <p className="text-slate-600 text-sm mb-5">
                <span className="font-semibold">{selectedAppointment.petName}</span> —{" "}
                {selectedAppointment.clientName} · {selectedAppointment.service} às {selectedAppointment.time}
              </p>

              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Condição do Pet *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["normal", "agitated", "shy", "injured"] as const).map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setFormData({ ...formData, petCondition: cond })}
                        className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                          formData.petCondition === cond
                            ? "border-teal-500 bg-teal-50 text-teal-800"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {conditionLabels[cond].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações na Entrada</label>
                  <textarea
                    rows={3}
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Alergias, pedidos especiais, comportamento..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium"
                  >
                    <LogIn className="h-4 w-4" />
                    Confirmar Check-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
