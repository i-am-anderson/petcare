import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Client, Pet, Employee, Appointment } from "../types";
import { Plus, X, Calendar as CalendarIcon, Clock, User, PawPrint } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AppointmentCalendar() {
  const [clients] = useLocalStorage<Client[]>("clients", []);
  const [pets] = useLocalStorage<Pet[]>("pets", []);
  const [employees] = useLocalStorage<Employee[]>("employees", []);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>("appointments", []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    petId: "",
    employeeId: "",
    service: "",
    time: "",
    notes: "",
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.date), date));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const selectedPet = pets.find((p) => p.id === formData.petId);
    const selectedEmployee = employees.find((e) => e.id === formData.employeeId);
    if (!selectedPet || !selectedEmployee) return;

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      petId: formData.petId,
      petName: selectedPet.name,
      clientId: selectedPet.clientId,
      clientName: selectedPet.clientName,
      employeeId: formData.employeeId,
      employeeName: selectedEmployee.name,
      service: formData.service,
      date: selectedDate.toISOString(),
      time: formData.time,
      status: "scheduled",
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    setAppointments([...appointments, newAppointment]);
    setShowModal(false);
    setFormData({ petId: "", employeeId: "", service: "", time: "", notes: "" });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      setAppointments(appointments.filter((a) => a.id !== id));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Calendário de Agendamentos</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            ← Anterior
          </button>
          <h2 className="text-xl font-semibold text-slate-900">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Próximo →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center font-semibold text-slate-700 py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-24 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 ${
                  !isCurrentMonth ? "bg-slate-50 text-slate-400" : ""
                } ${isToday ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className={`font-medium mb-1 ${isToday ? "text-blue-600" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate"
                    >
                      {apt.time} - {apt.petName}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-slate-500">+{dayAppointments.length - 2} mais</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Agendamentos - {format(selectedDate, "dd/MM/yyyy")}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Agendamentos do dia</h3>
                <div className="space-y-2">
                  {getAppointmentsForDate(selectedDate).map((apt) => (
                    <div key={apt.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-slate-600" />
                            <span className="font-medium">{apt.time}</span>
                            <span className="text-slate-600">- {apt.service}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 ml-6">
                            <PawPrint className="h-3 w-3" />
                            {apt.petName} ({apt.clientName})
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 ml-6">
                            <User className="h-3 w-3" />
                            {apt.employeeName}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {getAppointmentsForDate(selectedDate).length === 0 && (
                    <p className="text-slate-500 text-sm">Nenhum agendamento para este dia</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Novo Agendamento</h3>
                {pets.length === 0 || employees.length === 0 ? (
                  <p className="text-slate-600">
                    Você precisa cadastrar pets e funcionários antes de criar agendamentos.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="petId" className="block text-sm font-medium text-slate-700 mb-1">
                          Pet *
                        </label>
                        <select
                          id="petId"
                          required
                          value={formData.petId}
                          onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione um pet</option>
                          {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                              {pet.name} - {pet.clientName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">
                          Funcionário *
                        </label>
                        <select
                          id="employeeId"
                          required
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione um funcionário</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name} - {employee.role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="service" className="block text-sm font-medium text-slate-700 mb-1">
                          Serviço *
                        </label>
                        <select
                          id="service"
                          required
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione</option>
                          <option value="Banho">Banho</option>
                          <option value="Tosa">Tosa</option>
                          <option value="Banho e Tosa">Banho e Tosa</option>
                          <option value="Hidratação">Hidratação</option>
                          <option value="Corte de Unhas">Corte de Unhas</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-1">
                          Horário *
                        </label>
                        <input
                          type="time"
                          id="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                          Observações
                        </label>
                        <textarea
                          id="notes"
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4" />
                        Agendar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                      >
                        Fechar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
