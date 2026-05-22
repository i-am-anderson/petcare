import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { router } from "./routes";
import { useLocalStorage } from "./hooks/useLocalStorage";

import {
  Client,
  Pet,
  Employee,
  Appointment,
  CheckInRecord,
  ManualTransaction,
  PetNote,
  ServiceOrder,
  Transaction,
} from "./types";

import { appointmentsJson } from "../data/appointments";
import { clientsJson } from "../data/clients";
import { employeesJson } from "../data/employees";
import { petsJson } from "../data/pets";
import { checkInsJson } from "../data/checkIns";
import { manualTransactionsJson } from "../data/manualTransactions";
import { petNotesJson } from "../data/petNotes";
import { serviceOrdersJson } from "../data/serviceOrders";
import { transactionsJson } from "../data/transactions";

export default function App() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [pets, setPets] = useLocalStorage<Pet[]>("pets", []);
  const [employees, setEmployees] = useLocalStorage<Employee[]>("employees", []);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(
    "appointments",
    [],
  );

  const [checkIns, setCheckIns] = useLocalStorage<CheckInRecord[]>(
    "checkIns",
    [],
  );

  const [manualTransactions, setManualTransactions] =
    useLocalStorage<ManualTransaction[]>("manualTransactions", []);

  const [petNotes, setPetNotes] = useLocalStorage<PetNote[]>("petNotes", []);

  const [serviceOrders, setServiceOrders] = useLocalStorage<ServiceOrder[]>(
    "serviceOrders",
    [],
  );

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "transactions",
    [],
  );

  const [date, setDate] = useLocalStorage<string>("date", "");

  useEffect(() => {
    const now = new Date().toISOString().split("T")[0];

    const storageConfig = [
      {
        data: clients,
        setData: setClients,
        initial: clientsJson,
      },
      {
        data: pets,
        setData: setPets,
        initial: petsJson,
      },
      {
        data: employees,
        setData: setEmployees,
        initial: employeesJson,
      },
      {
        data: appointments,
        setData: setAppointments,
        initial: appointmentsJson,
      },
      {
        data: checkIns,
        setData: setCheckIns,
        initial: checkInsJson,
      },
      {
        data: manualTransactions,
        setData: setManualTransactions,
        initial: manualTransactionsJson,
      },
      {
        data: petNotes,
        setData: setPetNotes,
        initial: petNotesJson,
      },
      {
        data: serviceOrders,
        setData: setServiceOrders,
        initial: serviceOrdersJson,
      },
      {
        data: transactions,
        setData: setTransactions,
        initial: transactionsJson,
      },
    ];

    const isNewDay = date !== now;

    storageConfig.forEach(({ data, setData, initial }) => {
      if (data.length === 0 || isNewDay) {
        setData(initial);
      }
    });

    if (isNewDay) {
      setDate(now);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === "F5") {
        event.preventDefault();

        localStorage.clear();
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <RouterProvider router={router} />;
}