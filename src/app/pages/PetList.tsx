import { useState } from "react";
import { Link } from "react-router";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Pet } from "../types";
import { Plus, Search, User, Trash2, ShieldCheck, Scissors } from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/ui/pagination";

const PAGE_SIZE = 10;

const SPECIES_EMOJI: Record<string, string> = {
  Cão: "🐶",
  Gato: "🐱",
  Ave: "🐦",
  Roedor: "🐹",
  Réptil: "🦎",
  Outro: "🐾",
};

export function PetList() {
  const [pets, setPets] = useLocalStorage<Pet[]>("pets", []);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.color && pet.color.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pagination = usePagination(filteredPets, PAGE_SIZE);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este pet?")) {
      setPets(pets.filter((p) => p.id !== id));
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pets</h1>
          <p className="text-sm text-slate-500 mt-1">{pets.length} pet(s) cadastrado(s)</p>
        </div>
        <Link
          to="/pets/cadastro"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Novo Pet
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, tutor, espécie, raça ou pelagem..."
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
                  Pet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Espécie / Raça
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Dados Físicos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {searchTerm ? "Nenhum pet encontrado" : "Nenhum pet cadastrado"}
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((pet) => (
                  <tr key={pet.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                          {pet.photo ? (
                            <img
                              src={pet.photo}
                              alt={pet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{SPECIES_EMOJI[pet.species] ?? "🐾"}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{pet.name}</div>
                          {pet.gender && (
                            <div className="text-xs text-slate-400">{pet.gender}</div>
                          )}
                          {pet.microchip && (
                            <div className="text-xs text-slate-400">chip: {pet.microchip}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{pet.species}</div>
                      <div className="text-sm text-slate-500">{pet.breed}</div>
                      {pet.color && (
                        <div className="text-xs text-slate-400">{pet.color}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{pet.age} ano(s)</div>
                      {pet.weight && (
                        <div className="text-sm text-slate-500">{pet.weight} kg</div>
                      )}
                      {pet.lastVetVisit && (
                        <div className="text-xs text-slate-400">
                          Vet: {new Date(pet.lastVetVisit).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {pet.isVaccinated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <ShieldCheck className="h-3 w-3" />
                            Vacinado
                          </span>
                        )}
                        {pet.isNeutered && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                            <Scissors className="h-3 w-3" />
                            Castrado
                          </span>
                        )}
                        {pet.allergies && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                            ⚠ Alergia
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4 shrink-0" />
                        {pet.clientName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(pet.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir pet"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} onPageChange={pagination.goToPage} />
      </div>
    </div>
  );
}