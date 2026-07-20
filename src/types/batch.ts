import type {
  AgeBand,
  BookingSource,
  BookingStatus,
  Gender,
  SlotStatus,
  TripUpdateType,
} from "@prisma/client";

export type OperatorBatchListItem = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedSeats: number;
  seatsLeft: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  minSeatsToConfirm: number | null;
  status: SlotStatus;
  guideName: string | null;
  vehicleLabel: string | null;
  bookingCount: number;
};

export type OperatorBatchRosterBooking = {
  id: string;
  bookingRef: string;
  travelerName: string;
  travelerEmail: string;
  customerPhone: string | null;
  customerGender: Gender | null;
  groupSize: number;
  status: BookingStatus;
  source: BookingSource;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  medicalNotes: string | null;
  participants: {
    id: string;
    name: string;
    gender: Gender | null;
    ageBand: AgeBand | null;
    age: number | null;
    checkInAt: string | null;
  }[];
};

export type OperatorBatchDetail = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  listingMeetingPoint: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedSeats: number;
  seatsLeft: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  ageBandCounts: Partial<Record<AgeBand, number>>;
  minSeatsToConfirm: number | null;
  status: SlotStatus;
  meetingPointOverride: string | null;
  pickupNote: string | null;
  weatherNote: string | null;
  assignedGuideId: string | null;
  assignedVehicleId: string | null;
  guide: {
    id: string;
    name: string;
    phone: string | null;
    phonePublic: boolean;
    role: string;
  } | null;
  vehicle: {
    id: string;
    type: string;
    plate: string;
    capacity: number | null;
  } | null;
  bookings: OperatorBatchRosterBooking[];
  updates: {
    id: string;
    title: string;
    body: string;
    type: TripUpdateType;
    pinned: boolean;
    createdAt: string;
  }[];
};

export type OperatorGuideRow = {
  id: string;
  name: string;
  phone: string | null;
  gender: Gender | null;
  role: string;
  phonePublic: boolean;
  active: boolean;
};

export type OperatorVehicleRow = {
  id: string;
  type: string;
  plate: string;
  capacity: number | null;
  notes: string | null;
  active: boolean;
};

export type ImportPreviewRow = {
  row: number;
  name: string;
  gender?: string | null;
  age?: string | number | null;
  ageBand?: string | null;
  phone?: string | null;
  email?: string | null;
  errors: string[];
  action: "CREATE_BOOKING" | "ATTACH" | "SKIP";
  matchBookingId?: string;
};
