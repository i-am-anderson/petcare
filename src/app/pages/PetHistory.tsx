import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Pet, Appointment } from "../types";
import { CheckInRecord } from "./CheckIn";
import { Transaction } from "./CheckOut";
import {
  PawPrint, Search, ChevronDown, ChevronUp, Calendar, DollarSign,
  AlertTriangle, Heart, FileText, User, Plus, X, Edit2, Save
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PetNote {
  id: string;
  petId: string;
  type: "allergy" | "behavior" | "health" | "preference" | "general";
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NOTE_TYPE_CONFIG = {
  allergy: { label: "Alergia", color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle },
  behavior: { label: "Comportamento", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Heart },
  health: { label: "Saúde", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Heart },
  preference: { label: "Preferência", color: "bg-purple-100 text-purple-800 border-purple-200", icon: FileText },
  general: { label: "Geral", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
};

export function PetHistory() {
  const [pets] = useLocalStorage<Pet[]>("pets", []);
  const [appointments] = useLocalStorage<Appointment[]>("appointments", []);
  const [checkIns] = useLocalStorage<CheckInRecord[]>("checkIns", []);
  const [transactions] = useLocalStorage<Transaction[]>("transactions", []);
  const [petNotes, setPetNotes] = useLocalStorage<PetNote[]>("petNotes", []);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPet, setExpandedPet] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({
    type: "general" as PetNote["type"],
    content: "",
  });
  const [editingNote, setEditingNote] = useState<PetNote | null>(null);

  const filteredPets = useMemo(() => {
    return pets.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pets, searchTerm]);

  const getPetAppointments = (petId: string) =>
    appointments
      .filter((a) => a.petId === petId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPetCheckIns = (petId: string) =>
    checkIns
      .filter((ci) => ci.petId === petId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPetTransactions = (petId: string) => {
    const checkInIds = checkIns.filter((ci) => ci.petId === petId).map((ci) => ci.id);
    return transactions
      .filter((t) => checkInIds.includes(t.checkInId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getPetNotes = (petId: string) =>
    petNotes
      .filter((n) => n.petId === petId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const getTotalSpent = (petId: string) =>
    getPetTransactions(petId).reduce((s, t) => s + t.amount, 0);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) return;

    if (editingNote) {
      setPetNotes(
        petNotes.map((n) =>
          n.id === editingNote.id
            ? { ...n, type: noteForm.type, content: noteForm.content, updatedAt: new Date().toISOString() }
            : n
        )
      );
    } else {
      const newNote: PetNote = {
        id: crypto.randomUUID(),
        petId: selectedPetId,
        type: noteForm.type,
        content: noteForm.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPetNotes([...petNotes, newNote]);
    }

    setShowNoteModal(false);
    setEditingNote(null);
    setNoteForm({ type: "general", content: "" });
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Excluir esta observação?")) {
      setPetNotes(petNotes.filter((n) => n.id !== noteId));
    }
  };

  const openEditNote = (note: PetNote) => {
    setEditingNote(note);
    setSelectedPetId(note.petId);
    setNoteForm({ type: note.type, content: note.content });
    setShowNoteModal(true);
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const statusLabels: Record<string, string> = {
    scheduled: "Agendado",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Histórico Completo do Pet</h1>
        <p className="text-slate-600 mt-1">Ficha detalhada com comportamento, alergias e atendimentos</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do pet ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredPets.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          {searchTerm ? "Nenhum pet encontrado" : "Nenhum pet cadastrado"}
        </div>
      )}

      <div className="space-y-4">
        {filteredPets.map((pet) => {
          const petApts = getPetAppointments(pet.id);
          const petCIs = getPetCheckIns(pet.id);
          const petTxns = getPetTransactions(pet.id);
          const notes = getPetNotes(pet.id);
          const totalSpent = getTotalSpent(pet.id);
          const isExpanded = expandedPet === pet.id;

          return (
            <div key={pet.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              {/* Pet header */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedPet(isExpanded ? null : pet.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-100 rounded-full">
                    <PawPrint className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{pet.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-0.5">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{pet.clientName}</span>
                      <span>{pet.species} · {pet.breed} · {pet.age} ano{pet.age !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-500 uppercase font-medium">Atendimentos</p>
                    <p className="text-lg font-bold text-slate-900">{petCIs.filter((ci) => ci.status === "checked_out").length}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-500 uppercase font-medium">Total Gasto</p>
                    <p className="text-lg font-bold text-emerald-700">R$ {totalSpent.toFixed(2)}</p>
                  </div>
                  {notes.some((n) => n.type === "allergy") && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      <AlertTriangle className="h-3 w-3" /> Alergia
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">

                    {/* Notes section */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">Observações & Alergias</h4>
                        <button
                          onClick={() => {
                            setSelectedPetId(pet.id);
                            setNoteForm({ type: "general", content: "" });
                            setEditingNote(null);
                            setShowNoteModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                        >
                          <Plus className="h-3 w-3" /> Adicionar
                        </button>
                      </div>
                      {notes.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhuma observação</p>
                      ) : (
                        <div className="space-y-2">
                          {notes.map((note) => {
                            const config = NOTE_TYPE_CONFIG[note.type];
                            const Icon = config.icon;
                            return (
                              <div key={note.id} className={`rounded-lg border p-3 ${config.color}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5">{config.label}</p>
                                      <p className="text-sm">{note.content}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => openEditNote(note)} className="p-1 rounded hover:bg-white hover:bg-opacity-50">
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => handleDeleteNote(note.id)} className="p-1 rounded hover:bg-white hover:bg-opacity-50">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Service history */}
                    <div className="p-5">
                      <h4 className="font-semibold text-slate-900 mb-3">Histórico de Serviços</h4>
                      {petCIs.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum atendimento registrado</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {petCIs.slice(0, 10).map((ci) => (
                            <div key={ci.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{ci.service}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {format(parseISO(ci.date), "dd/MM/yyyy", { locale: ptBR })} · {ci.checkInTime}
                                  </p>
                                  <p className="text-xs text-slate-500">{ci.employeeName}</p>
                                  {ci.observations && (
                                    <p className="text-xs text-amber-700 mt-1">{ci.observations}</p>
                                  )}
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                  ci.status === "checked_out" ? "bg-green-100 text-green-800" :
                                  ci.status === "done" ? "bg-blue-100 text-blue-800" :
                                  "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {ci.status === "checked_out" ? "Concluído" :
                                   ci.status === "done" ? "Pronto" :
                                   ci.status === "in_service" ? "Em serviço" : "Aguardando"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Financial summary */}
                    <div className="p-5">
                      <h4 className="font-semibold text-slate-900 mb-3">Financeiro</h4>
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 mb-4">
                        <p className="text-sm text-emerald-700 font-medium">Total investido</p>
                        <p className="text-2xl font-bold text-emerald-800">R$ {totalSpent.toFixed(2)}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{petTxns.length} pagamento{petTxns.length !== 1 ? "s" : ""}</p>
                      </div>
                      {petTxns.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum pagamento registrado</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {petTxns.slice(0, 8).map((t) => (
                            <div key={t.id} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium text-slate-700">{t.service}</p>
                                <p className="text-xs text-slate-500">
                                  {format(parseISO(t.createdAt), "dd/MM/yyyy")}
                                </p>
                              </div>
                              <span className="font-semibold text-emerald-700">R$ {t.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingNote ? "Editar Observação" : "Nova Observação"}
              </h2>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(NOTE_TYPE_CONFIG) as PetNote["type"][]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, type })}
                      className={`py-2 rounded-md border text-xs font-medium transition-colors ${
                        noteForm.type === type
                          ? NOTE_TYPE_CONFIG[type].color + " border-current"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {NOTE_TYPE_CONFIG[type].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                <textarea
                  required
                  rows={4}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Descreva a observação com detalhes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                >
                  <Save className="h-4 w-4" />
                  {editingNote ? "Salvar Alteração" : "Adicionar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
