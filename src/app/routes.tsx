import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ClientRegister } from "./pages/ClientRegister";
import { ClientList } from "./pages/ClientList";
import { PetRegister } from "./pages/PetRegister";
import { PetList } from "./pages/PetList";
import { EmployeeRegister } from "./pages/EmployeeRegister";
import { EmployeeList } from "./pages/EmployeeList";
import { AppointmentCalendar } from "./pages/AppointmentCalendar";
import { ServiceHistory } from "./pages/ServiceHistory";
import { Login } from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "clientes/cadastro", Component: ClientRegister },
      { path: "clientes/consulta", Component: ClientList },
      { path: "pets/cadastro", Component: PetRegister },
      { path: "pets/consulta", Component: PetList },
      { path: "funcionarios/cadastro", Component: EmployeeRegister },
      { path: "funcionarios/consulta", Component: EmployeeList },
      { path: "checkin", Component: AppointmentCalendar },
      { path: "ordens-servico", Component: AppointmentCalendar },
      { path: "checkout", Component: AppointmentCalendar },
      { path: "agendamentos", Component: AppointmentCalendar },
      { path: "historico", Component: ServiceHistory },
      { path: "historico-pets", Component: ServiceHistory },
      { path: "financeiro", Component: ServiceHistory },
    ],
  },
]);
