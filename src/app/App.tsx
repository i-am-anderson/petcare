import { RouterProvider } from "react-router";
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
import appointmentsJson from "../data/appointments.json";
import clientsJson from "../data/clients.json";
import employeesJson from "../data/employees.json";
import petsJson from "../data/pets.json";
import checkInsJson from "../data/checkIns.json";
import manualTransactionsJson from "../data/manualTransactions.json";
import petNotesJson from "../data/petNotes.json";
import serviceOrdersJson from "../data/serviceOrders.json";
import transactionsJson from "../data/transactions.json";

export default function App() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [pets, setPets] = useLocalStorage<Pet[]>("pets", []);
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    "employees",
    [],
  );
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(
    "appointments",
    [],
  );
  const [checkIns, setCheckIns] = useLocalStorage<CheckInRecord[]>(
    "checkIns",
    [],
  );
  const [manualTransactions, setManualTransactions] = useLocalStorage<
    ManualTransaction[]
  >("manualTransactions", []);
  const [petNotes, setPetNotes] = useLocalStorage<PetNote[]>("petNotes", []);
  const [serviceOrders, setServiceOrders] = useLocalStorage<ServiceOrder[]>(
    "serviceOrders",
    [],
  );
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "transactions",
    [],
  );

  if (clients.length === 0) setClients([...clients, ...clientsJson]);

  if (pets.length === 0) setPets([...pets, ...petsJson]);

  if (employees.length === 0) setEmployees([...employees, ...employeesJson]);

  if (appointments.length === 0)
    setAppointments([...appointments, ...appointmentsJson]);

  if (checkIns.length === 0) setCheckIns([...checkIns, ...checkInsJson]);

  if (manualTransactions.length === 0) setManualTransactions([...manualTransactions, ...manualTransactionsJson]);

  if (petNotes.length === 0) setPetNotes([...petNotes, ...petNotesJson]);

  if (serviceOrders.length === 0) setServiceOrders([...serviceOrders, ...serviceOrdersJson]);

  if (transactions.length === 0) setTransactions([...transactions, ...transactionsJson]);


  return <RouterProvider router={router} />;
}
