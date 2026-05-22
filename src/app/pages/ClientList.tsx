import { useState } from "react";
import { Link } from "react-router";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Client } from "../types";
import { Plus, Search, Mail, Phone, MapPin, Trash2, MessageCircle, FileText, Pencil, X } from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/ui/pagination";

const PAGE_SIZE = 10;

export function ClientList() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.cpf && client.cpf.includes(searchTerm)) ||
      (client.city && client.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pagination = usePagination(filteredClients, PAGE_SIZE);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setClients(clients.map(c => c.id === editingClient.id ? editingClient : c));
    setEditingClient(null);
  };

  const formatAge = (birthdate?: string) => {
    if (!birthdate) return null;
    const diff = Date.now() - new Date(birthdate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <Link
          to="/clientes/cadastro"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, email, telefone ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nome / CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Observações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{client.name}</div>
                      {client.cpf && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <FileText className="h-3 w-3" />
                          {client.cpf}
                        </div>
                      )}
                      {client.birthdate && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {formatAge(client.birthdate)} anos
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4 shrink-0" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 shrink-0" />
                          {client.phone}
                        </div>
                        {client.whatsapp && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <MessageCircle className="h-4 w-4 shrink-0" />
                            {client.whatsapp}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <div>{client.address}</div>
                          {(client.city || client.state) && (
                            <div className="text-slate-400">
                              {[client.city, client.state].filter(Boolean).join(" - ")}
                              {client.zipCode && ` · ${client.zipCode}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {client.notes ? (
                        <p className="text-sm text-slate-500 truncate" title={client.notes}>
                          {client.notes}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingClient(client)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar cliente"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} onPageChange={pagination.goToPage} />
      </div>

      {editingClient && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Editar Cliente
                </h2>
                <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                      <input
                        type="text"
                        required
                        value={editingClient.name}
                        onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                      <input
                        type="email"
                        required
                        value={editingClient.email}
                        onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone *</label>
                      <input
                        type="tel"
                        required
                        value={editingClient.phone}
                        onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        value={editingClient.whatsapp || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                    <input
                      type="text"
                      value={editingClient.address || ""}
                      onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={editingClient.city || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">UF</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={editingClient.state || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, state: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
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