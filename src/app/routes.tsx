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
import { CheckIn } from "./pages/CheckIn";
import { ServiceOrderPage } from "./pages/ServiceOrderPage";
import { CheckOut } from "./pages/CheckOut";
import { FinancialDashboard } from "./pages/FinancialDashboard";
import { PetHistory } from "./pages/PetHistory";


export const router = createBrowserRouter([
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
      { path: "agendamentos", Component: AppointmentCalendar },
      { path: "historico", Component: ServiceHistory },
      { path: "checkin", Component: CheckIn },
      { path: "ordem-servico", Component: ServiceOrderPage },
      { path: "checkout", Component: CheckOut },
      { path: "financeiro", Component: FinancialDashboard },
      { path: "historico-pets", Component: PetHistory },
    ],
  },
]);
