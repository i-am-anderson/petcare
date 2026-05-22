import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

import { appointmentsJson } from "./data/appointments";
import { clientsJson } from "./data/clients";
import { employeesJson } from "./data/employees";
import { petsJson } from "./data/pets";
import { checkInsJson } from "./data/checkIns";
import { manualTransactionsJson } from "./data/manualTransactions";
import { petNotesJson } from "./data/petNotes";
import { serviceOrdersJson } from "./data/serviceOrders";
import { transactionsJson } from "./data/transactions";

const getTodayString = () => new Date().toISOString().slice(0, 10);

const seedLocalStorage = () => {
  localStorage.setItem("clients", JSON.stringify(clientsJson));
  localStorage.setItem("pets", JSON.stringify(petsJson));
  localStorage.setItem("employees", JSON.stringify(employeesJson));
  localStorage.setItem("appointments", JSON.stringify(appointmentsJson));
  localStorage.setItem("checkIns", JSON.stringify(checkInsJson));
  localStorage.setItem(
    "manualTransactions",
    JSON.stringify(manualTransactionsJson),
  );
  localStorage.setItem("petNotes", JSON.stringify(petNotesJson));
  localStorage.setItem("serviceOrders", JSON.stringify(serviceOrdersJson));
  localStorage.setItem("transactions", JSON.stringify(transactionsJson));
  localStorage.setItem("dataDate", getTodayString());
};

// Roda ANTES do createRoot — React ainda não existe nesse ponto.
// Se não há dados ou a data mudou, re-seed (getDate recalcula as datas)
const storedDate = localStorage.getItem("dataDate");
const hasData = localStorage.getItem("clients") !== null;

if (!hasData || storedDate !== getTodayString()) {
  seedLocalStorage();
}

// Só agora o React monta — useLocalStorage já encontra tudo no storage
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
