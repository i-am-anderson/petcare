# Guia de Integração — Novos Módulos PI!Pet

## Arquivos entregues

| Arquivo | Módulo | Rota sugerida |
|---|---|---|
| `CheckIn.tsx` | Check-in do Pet | `/checkin` |
| `ServiceOrderPage.tsx` | Ordem de Serviço | `/ordem-servico` |
| `CheckOut.tsx` | Check-out + Pagamento | `/checkout` |
| `FinancialDashboard.tsx` | Caixa / Financeiro | `/financeiro` |
| `PetHistory.tsx` | Histórico Completo do Pet | `/historico-pets` |
| `ServiceHistory.tsx` | Relatórios (substitui o original) | `/historico` |

---

## Fluxo de atendimento

```
Agendamento (AppointmentCalendar)
        ↓
Check-in (CheckIn.tsx)           ← registra entrada, condição do pet
        ↓
Ordem de Serviço (ServiceOrderPage.tsx)  ← inicia / conclui serviço
        ↓
Check-out (CheckOut.tsx)         ← registra pagamento
        ↓
Financeiro (FinancialDashboard.tsx)  ← visão consolidada do caixa
```

---

## Tipos adicionais para `types.ts`

Adicione ao seu arquivo `src/types.ts`:

```ts
// Check-in
export interface CheckInRecord {
  id: string;
  appointmentId: string;
  petId: string;
  petName: string;
  clientId: string;
  clientName: string;
  service: string;
  employeeId: string;
  employeeName: string;
  scheduledTime: string;
  checkInTime: string;
  observations: string;
  petCondition: "normal" | "agitated" | "shy" | "injured";
  status: "waiting" | "in_service" | "done" | "checked_out";
  date: string;
  createdAt: string;
}

// Ordem de Serviço
export interface ServiceOrder {
  id: string;
  checkInId: string;
  petId: string;
  petName: string;
  clientName: string;
  service: string;
  employeeId: string;
  employeeName: string;
  startTime?: string;
  endTime?: string;
  status: "pending" | "in_progress" | "completed";
  internalNotes: string;
  createdAt: string;
}

// Transação financeira (gerada no checkout)
export interface Transaction {
  id: string;
  checkInId: string;
  serviceOrderId: string;
  petName: string;
  clientName: string;
  service: string;
  amount: number;
  paymentMethod: "cash" | "credit_card" | "debit_card" | "pix";
  status: "paid";
  checkOutTime: string;
  createdAt: string;
}

// Lançamento manual (financeiro)
export interface ManualTransaction {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  createdAt: string;
}

// Observação do pet
export interface PetNote {
  id: string;
  petId: string;
  type: "allergy" | "behavior" | "health" | "preference" | "general";
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## localStorage keys usados

| Key | Tipo | Usado em |
|---|---|---|
| `clients` | `Client[]` | existente |
| `pets` | `Pet[]` | existente |
| `employees` | `Employee[]` | existente |
| `appointments` | `Appointment[]` | existente |
| `checkIns` | `CheckInRecord[]` | CheckIn, ServiceOrderPage, CheckOut |
| `serviceOrders` | `ServiceOrder[]` | ServiceOrderPage, CheckOut |
| `transactions` | `Transaction[]` | CheckOut, FinancialDashboard, ServiceHistory |
| `manualTransactions` | `ManualTransaction[]` | FinancialDashboard |
| `petNotes` | `PetNote[]` | PetHistory |

---

## Preços de serviços

Os preços padrão estão definidos no `ServiceOrderPage.tsx` e `CheckOut.tsx`.
Para centralizar, crie um arquivo `src/constants/servicePrices.ts`:

```ts
export const SERVICE_PRICES: Record<string, number> = {
  "Banho": 60,
  "Tosa": 80,
  "Banho e Tosa": 120,
  "Hidratação": 50,
  "Corte de Unhas": 30,
};
```

E substitua os objetos locais nos dois arquivos por um import desse módulo.

---

## Rotas (exemplo com React Router v6)

```tsx
// App.tsx ou router config
import { CheckIn } from "./pages/CheckIn";
import { ServiceOrderPage } from "./pages/ServiceOrderPage";
import { CheckOut } from "./pages/CheckOut";
import { FinancialDashboard } from "./pages/FinancialDashboard";
import { PetHistory } from "./pages/PetHistory";
import { ServiceHistory } from "./pages/ServiceHistory";

// dentro de <Routes>:
<Route path="/checkin" element={<CheckIn />} />
<Route path="/ordem-servico" element={<ServiceOrderPage />} />
<Route path="/checkout" element={<CheckOut />} />
<Route path="/financeiro" element={<FinancialDashboard />} />
<Route path="/historico-pets" element={<PetHistory />} />
<Route path="/historico" element={<ServiceHistory />} />
```
