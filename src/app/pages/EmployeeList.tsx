import { useState } from "react";
import { Link } from "react-router";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Employee } from "../types";
import { Plus, Search, Mail, Phone, Briefcase, Trash2, User, Calendar, Pencil, X } from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/ui/pagination";

const PAGE_SIZE = 10;

const ROLE_COLORS: Record<string, string> = {
  Veterinário: "bg-blue-100 text-blue-800",
  Tosador: "bg-green-100 text-green-800",
  Banhista: "bg-teal-100 text-teal-800",
  Recepcionista: "bg-yellow-100 text-yellow-800",
  Gerente: "bg-purple-100 text-purple-800",
  Auxiliar: "bg-slate-100 text-slate-700",
};

export function EmployeeList() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>("employees", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.cpf && employee.cpf.includes(searchTerm))
  );

  const pagination = usePagination(filteredEmployees, PAGE_SIZE);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setEmployees(employees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
    setEditingEmployee(null);
  };

  const formatHireDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getYearsOfService = (hireDate?: string) => {
    if (!hireDate) return null;
    const diff = Date.now() - new Date(hireDate).getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    if (years === 0) {
      const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
      return `${months}m`;
    }
    return `${years}a`;
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Funcionários</h1>
          <p className="text-sm text-slate-500 mt-1">{employees.length} funcionário(s) cadastrado(s)</p>
        </div>
        <Link
          to="/funcionarios/cadastro"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, email ou função..."
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
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Admissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    {searchTerm ? "Nenhum funcionário encontrado" : "Nenhum funcionário cadastrado"}
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {employee.photo ? (
                            <img
                              src={employee.photo}
                              alt={employee.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{employee.name}</div>
                          {employee.cpf && (
                            <div className="text-xs text-slate-400">{employee.cpf}</div>
                          )}
                          {employee.crmv && (
                            <div className="text-xs text-blue-500">CRMV: {employee.crmv}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ROLE_COLORS[employee.role] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {employee.role}
                        </span>
                      </div>
                      {employee.workSchedule && (
                        <div className="text-xs text-slate-400 mt-1 ml-6">{employee.workSchedule}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4 shrink-0" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 shrink-0" />
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {employee.hireDate ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <div>
                            <div>{formatHireDate(employee.hireDate)}</div>
                            <div className="text-xs text-slate-400">
                              {getYearsOfService(employee.hireDate)} na empresa
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingEmployee(employee)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar funcionário"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir funcionário"
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

      {editingEmployee && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Editar Funcionário
                </h2>
                <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-slate-600">
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
                        value={editingEmployee.name}
                        onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                      <input
                        type="email"
                        required
                        value={editingEmployee.email}
                        onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
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
                        value={editingEmployee.phone}
                        onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Função *</label>
                      <select
                        required
                        value={editingEmployee.role}
                        onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione...</option>
                        {Object.keys(ROLE_COLORS).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                      <input
                        type="text"
                        value={editingEmployee.cpf || ""}
                        onChange={(e) => setEditingEmployee({ ...editingEmployee, cpf: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CRMV</label>
                      <input
                        type="text"
                        value={editingEmployee.crmv || ""}
                        onChange={(e) => setEditingEmployee({ ...editingEmployee, crmv: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
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