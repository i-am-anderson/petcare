import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Client, Pet } from "../types";
import { ArrowLeft, Save, Upload, PawPrint } from "lucide-react";

export function PetRegister() {
  const navigate = useNavigate();
  const [clients] = useLocalStorage<Client[]>("clients", []);
  const [pets, setPets] = useLocalStorage<Pet[]>("pets", []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    gender: "",
    age: "",
    color: "",
    weight: "",
    clientId: "",
    isNeutered: false,
    isVaccinated: false,
    microchip: "",
    photo: "",
    allergies: "",
    medications: "",
    vetNotes: "",
    lastVetVisit: "",
  });

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

    const selectedClient = clients.find((c) => c.id === formData.clientId);
    if (!selectedClient) return;

    const newPet: Pet = {
      id: crypto.randomUUID(),
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      gender: formData.gender,
      age: parseInt(formData.age),
      color: formData.color,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      clientId: formData.clientId,
      clientName: selectedClient.name,
      isNeutered: formData.isNeutered,
      isVaccinated: formData.isVaccinated,
      microchip: formData.microchip,
      photo: formData.photo,
      allergies: formData.allergies,
      medications: formData.medications,
      vetNotes: formData.vetNotes,
      lastVetVisit: formData.lastVetVisit,
      createdAt: new Date().toISOString(),
    };

    setPets([...pets, newPet]);
    navigate("/pets/consulta");
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/pets/consulta"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Cadastro de Pet</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl">
        {clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">
              Você precisa cadastrar um cliente antes de cadastrar um pet.
            </p>
            <Link
              to="/clientes/cadastro"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cadastrar Cliente
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* Foto */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200">
              <div
                className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto do pet" className="w-full h-full object-cover" />
                ) : (
                  <PawPrint className="h-10 w-10 text-slate-300" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4" />
                  Foto do pet
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

            {/* Vínculo com Cliente */}
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
              Tutor
            </h2>
            <div className="mb-6">
              <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-1">
                Cliente / Tutor *
              </label>
              <select
                id="clientId"
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Identificação */}
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
              Identificação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Nome do pet *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="species" className="block text-sm font-medium text-slate-700 mb-1">
                  Espécie *
                </label>
                <select
                  id="species"
                  required
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione</option>
                  <option value="Cão">Cão</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Roedor">Roedor</option>
                  <option value="Réptil">Réptil</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-slate-700 mb-1">
                  Raça *
                </label>
                <input
                  type="text"
                  id="breed"
                  required
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
                  Sexo *
                </label>
                <select
                  id="gender"
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione</option>
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                </select>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">
                  Idade (anos) *
                </label>
                <input
                  type="number"
                  id="age"
                  required
                  min="0"
                  max="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-1">
                  Pelagem / Cor
                </label>
                <input
                  type="text"
                  id="color"
                  placeholder="Ex: caramelo, branco e preto..."
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-slate-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="microchip" className="block text-sm font-medium text-slate-700 mb-1">
                  Nº do Microchip
                </label>
                <input
                  type="text"
                  id="microchip"
                  placeholder="Ex: 985112345678901"
                  value={formData.microchip}
                  onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Status de Saúde */}
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
              Saúde
            </h2>
            <div className="space-y-4 mb-6">
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNeutered}
                    onChange={(e) => setFormData({ ...formData, isNeutered: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Castrado(a)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVaccinated}
                    onChange={(e) => setFormData({ ...formData, isVaccinated: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Vacinado(a)</span>
                </label>
              </div>

              <div>
                <label htmlFor="lastVetVisit" className="block text-sm font-medium text-slate-700 mb-1">
                  Última consulta veterinária
                </label>
                <input
                  type="date"
                  id="lastVetVisit"
                  value={formData.lastVetVisit}
                  onChange={(e) => setFormData({ ...formData, lastVetVisit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-slate-700 mb-1">
                  Alergias
                </label>
                <input
                  type="text"
                  id="allergies"
                  placeholder="Ex: frango, látex..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="medications" className="block text-sm font-medium text-slate-700 mb-1">
                  Medicamentos em uso
                </label>
                <input
                  type="text"
                  id="medications"
                  placeholder="Ex: omeprazol 10mg, frontline..."
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="vetNotes" className="block text-sm font-medium text-slate-700 mb-1">
                  Observações veterinárias
                </label>
                <textarea
                  id="vetNotes"
                  rows={3}
                  placeholder="Histórico, condições especiais, cuidados importantes..."
                  value={formData.vetNotes}
                  onChange={(e) => setFormData({ ...formData, vetNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Save className="h-4 w-4" />
                Salvar Pet
              </button>
              <Link
                to="/pets/consulta"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
