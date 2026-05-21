export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  clientId: string;
  clientName: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  clientId: string;
  clientName: string;
  employeeId: string;
  employeeName: string;
  service: string;
  date: string;
  time: string;
  status: string; // 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

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
  petCondition: string; // "normal" | "agitated" | "shy" | "injured";
  status: string; // "waiting" | "in_service" | "done" | "checked_out";
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
  status: string; // "pending" | "in_progress" | "completed";
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
  paymentMethod: string; // "cash" | "credit_card" | "debit_card" | "pix";
  status: string; // "paid";
  checkOutTime: string;
  createdAt: string;
}

// Lançamento manual (financeiro)
export interface ManualTransaction {
  id: string;
  type: string; // "income" | "expense";
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
  type: string; // "allergy" | "behavior" | "health" | "preference" | "general";
  content: string;
  createdAt: string;
  updatedAt: string;
}