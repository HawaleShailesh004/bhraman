import type {
  AgeBand,
  Gender,
  SlotStatus,
  TripUpdateType,
} from "@prisma/client";

export type TripHubParticipantPublic = {
  firstName: string;
  gender: Gender | null;
  ageBand: AgeBand | null;
};

export type TripHubData = {
  bookingId: string;
  bookingRef: string;
  status: string;
  groupSize: number;
  listingTitle: string;
  listingSlug: string;
  placeName: string;
  meetingPoint: string | null;
  pickupNote: string | null;
  weatherNote: string | null;
  startTime: string;
  endTime: string;
  slotStatus: SlotStatus;
  capacity: number;
  bookedSeats: number;
  seatsLeft: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  ageBandCounts: Partial<Record<AgeBand, number>>;
  minSeatsToConfirm: number | null;
  inclusions: string[];
  thingsToCarry: string[];
  guide: {
    name: string;
    phone: string | null;
    role: string;
  } | null;
  vehicle: {
    type: string;
    plate: string;
    capacity: number | null;
  } | null;
  /** Co-travelers visible only when booking is CONFIRMED or COMPLETED */
  coTravelers: TripHubParticipantPublic[] | null;
  updates: {
    id: string;
    title: string;
    body: string;
    type: TripUpdateType;
    pinned: boolean;
    createdAt: string;
  }[];
  hasUnreadUpdates: boolean;
  participants: {
    id: string;
    name: string;
    gender: Gender | null;
    ageBand: AgeBand | null;
  }[];
};

export type CheckoutParticipantInput = {
  name: string;
  gender?: Gender | null;
  ageBand?: AgeBand | null;
  age?: number | null;
};
