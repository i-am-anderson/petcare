import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Employee } from "../types";
import { ArrowLeft, Save, Upload, User } from "lucide-react";

export function EmployeeRegister() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useLocalStorage<Employee[]>("employees", []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthdate: "",
    role: "",
    hireDate: "",
    salary: "",
    workSchedule: "",
    crmv: "",
    photo: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  });

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setFormData((prev) => ({ ...prev, photo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary.replace(/\D/g, "")) / 100 : undefined,
      createdAt: new Date().toISOString(),
    };

    setEmployees([...employees, newEmployee]);
    navigate("/funcionarios/consulta");
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/funcionarios/consulta"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Cadastro de Funcionário</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>

          {/* Foto */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200">
            <div
              className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-slate-300" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" />
                Carregar foto
              </button>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG ou WEBP · máx. 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {/* Dados Pessoais */}
          <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                id="cpf"
                required
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-slate-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                id="birthdate"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                id="phone"
                required
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Dados Profissionais */}
          <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Dados Profissionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                Função *
              </label>
              <select
                id="role"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione</option>
                <option value="Tosador">Tosador</option>
                <option value="Banhista">Banhista</option>
                <option value="Veterinário">Veterinário</option>
                <option value="Recepcionista">Recepcionista</option>
                <option value="Gerente">Gerente</option>
                <option value="Auxiliar">Auxiliar</option>
              </select>
            </div>

            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-slate-700 mb-1">
                Data de Admissão *
              </label>
              <input
                type="date"
                id="hireDate"
                required
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-slate-700 mb-1">
                Salário (R$)
              </label>
              <input
                type="number"
                id="salary"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="workSchedule" className="block text-sm font-medium text-slate-700 mb-1">
                Jornada de Trabalho
              </label>
              <select
                id="workSchedule"
                value={formData.workSchedule}
                onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione</option>
                <option value="CLT 40h">CLT 40h semanais</option>
                <option value="CLT 30h">CLT 30h semanais</option>
                <option value="Meio período">Meio período</option>
                <option value="Freelancer">Freelancer / Autônomo</option>
                <option value="Estágio">Estágio</option>
              </select>
            </div>

            {formData.role === "Veterinário" && (
              <div>
                <label htmlFor="crmv" className="block text-sm font-medium text-slate-700 mb-1">
                  CRMV
                </label>
                <input
                  type="text"
                  id="crmv"
                  placeholder="Ex: SP-12345"
                  value={formData.crmv}
                  onChange={(e) => setFormData({ ...formData, crmv: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>

          {/* Contato de Emergência */}
          <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Contato de Emergência
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-slate-700 mb-1">
                Nome do contato
              </label>
              <input
                type="text"
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-slate-700 mb-1">
                Telefone do contato
              </label>
              <input
                type="tel"
                id="emergencyPhone"
                placeholder="(00) 00000-0000"
                value={formData.emergencyPhone}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyPhone: formatPhone(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Observações */}
          <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            Observações
          </h2>
          <div className="mb-6">
            <textarea
              id="notes"
              rows={3}
              placeholder="Informações adicionais sobre o funcionário..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <Save className="h-4 w-4" />
              Salvar Funcionário
            </button>
            <Link
              to="/funcionarios/consulta"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
