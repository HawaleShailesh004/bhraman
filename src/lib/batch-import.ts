import "server-only";

import { AgeBand, Gender, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recomputeSlotComposition } from "@/lib/batches";

export type ImportRow = {
  name: string;
  gender?: string | null;
  age?: string | number | null;
  ageBand?: string | null;
  phone?: string | null;
  email?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  medicalNotes?: string | null;
};

export type ImportPreviewRow = ImportRow & {
  row: number;
  errors: string[];
  action: "CREATE_BOOKING" | "ATTACH" | "SKIP";
  matchBookingId?: string;
};

function parseGender(raw: string | null | undefined): Gender | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (v === "M" || v === "MALE") return "MALE";
  if (v === "F" || v === "FEMALE") return "FEMALE";
  if (v === "OTHER" || v === "O") return "OTHER";
  if (v.includes("PREFER")) return "PREFER_NOT_TO_SAY";
  return null;
}

function parseAgeBand(
  raw: string | null | undefined,
  age: number | null,
): AgeBand | null {
  if (age !== null) {
    if (age < 18) return "UNDER_18";
    if (age <= 25) return "AGE_18_25";
    if (age <= 35) return "AGE_26_35";
    if (age <= 50) return "AGE_36_50";
    return "AGE_50_PLUS";
  }
  if (!raw) return null;
  const v = raw.trim().toUpperCase().replace(/-/g, "_").replace(/\s+/g, "_");
  if (v.includes("UNDER") || v === "U18" || v === "<18") return "UNDER_18";
  if (v.includes("18_25") || v === "18-25") return "AGE_18_25";
  if (v.includes("26_35") || v === "26-35") return "AGE_26_35";
  if (v.includes("36_50") || v === "36-50") return "AGE_36_50";
  if (v.includes("50") || v.includes("PLUS")) return "AGE_50_PLUS";
  if (Object.values(AgeBand).includes(v as AgeBand)) return v as AgeBand;
  return null;
}

function parseAge(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n < 1 || n > 120) return null;
  return n;
}

/** Parse CSV or TSV paste into rows. First row may be headers. */
export function parseRosterText(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const delim = lines[0].includes("\t") ? "\t" : ",";
  const split = (line: string) =>
    line.split(delim).map((c) => c.trim().replace(/^"|"$/g, ""));

  const header = split(lines[0]).map((h) => h.toLowerCase());
  const hasHeader = header.some((h) =>
    ["name", "gender", "phone", "email", "age"].includes(h),
  );

  const start = hasHeader ? 1 : 0;
  const idx = (keys: string[]) => {
    for (const k of keys) {
      const i = header.indexOf(k);
      if (i >= 0) return i;
    }
    return -1;
  };

  const nameI = hasHeader ? idx(["name", "full name", "traveler"]) : 0;
  const genderI = hasHeader ? idx(["gender", "sex"]) : 1;
  const ageI = hasHeader ? idx(["age"]) : 2;
  const ageBandI = hasHeader ? idx(["ageband", "age_band", "age band"]) : -1;
  const phoneI = hasHeader ? idx(["phone", "mobile", "whatsapp"]) : 3;
  const emailI = hasHeader ? idx(["email"]) : 4;
  const emNameI = hasHeader
    ? idx(["emergencyname", "emergency_name", "emergency name"])
    : -1;
  const emPhoneI = hasHeader
    ? idx(["emergencyphone", "emergency_phone", "emergency phone"])
    : -1;
  const medicalI = hasHeader ? idx(["medical", "medicalnotes", "notes"]) : -1;

  const rows: ImportRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const cols = split(lines[i]);
    const name = (nameI >= 0 ? cols[nameI] : cols[0])?.trim();
    if (!name) continue;
    rows.push({
      name,
      gender: genderI >= 0 ? cols[genderI] : null,
      age: ageI >= 0 ? cols[ageI] : null,
      ageBand: ageBandI >= 0 ? cols[ageBandI] : null,
      phone: phoneI >= 0 ? cols[phoneI] : null,
      email: emailI >= 0 ? cols[emailI] : null,
      emergencyName: emNameI >= 0 ? cols[emNameI] : null,
      emergencyPhone: emPhoneI >= 0 ? cols[emPhoneI] : null,
      medicalNotes: medicalI >= 0 ? cols[medicalI] : null,
    });
  }
  return rows;
}

export async function previewBatchImport(
  operatorId: string,
  slotId: string,
  rows: ImportRow[],
): Promise<{ preview: ImportPreviewRow[]; seatsLeft: number }> {
  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, listing: { operatorId } },
    include: {
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] } },
        select: {
          id: true,
          customerEmail: true,
          customerPhone: true,
          groupSize: true,
        },
      },
    },
  });
  if (!slot) throw new Error("SLOT_NOT_FOUND");

  const seatsLeft = Math.max(slot.capacity - slot.bookedSeats, 0);
  const preview: ImportPreviewRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];
    if (!row.name?.trim()) errors.push("Name required");
    const gender = parseGender(row.gender);
    const age = parseAge(row.age);
    const ageBand = parseAgeBand(row.ageBand, age);
    if (row.gender && !gender) errors.push("Invalid gender");

    const email = row.email?.trim().toLowerCase() || null;
    const phone = row.phone?.trim() || null;
    const match = slot.bookings.find(
      (b) =>
        (email && b.customerEmail?.toLowerCase() === email) ||
        (phone && b.customerPhone === phone),
    );

    let action: ImportPreviewRow["action"] = "CREATE_BOOKING";
    if (errors.length) action = "SKIP";
    else if (match) action = "ATTACH";

    preview.push({
      ...row,
      row: i + 1,
      errors,
      action,
      matchBookingId: match?.id,
    });
  }

  return { preview, seatsLeft };
}

function bookingRef() {
  return `IMP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export async function commitBatchImport(
  operatorId: string,
  slotId: string,
  rows: ImportRow[],
) {
  const { preview, seatsLeft } = await previewBatchImport(
    operatorId,
    slotId,
    rows,
  );

  const creates = preview.filter((p) => p.action === "CREATE_BOOKING");
  if (creates.length > seatsLeft) {
    throw new Error("CAPACITY_EXCEEDED");
  }

  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, listing: { operatorId } },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          basePrice: true,
          operator: { select: { userId: true } },
        },
      },
    },
  });
  if (!slot) throw new Error("SLOT_NOT_FOUND");

  const operatorUserId = slot.listing.operator.userId;
  let created = 0;
  let attached = 0;

  await prisma.$transaction(async (tx) => {
    for (const row of preview) {
      if (row.action === "SKIP") continue;

      const gender = parseGender(row.gender);
      const age = parseAge(row.age);
      const ageBand = parseAgeBand(row.ageBand, age);
      const name = row.name.trim();

      if (row.action === "ATTACH" && row.matchBookingId) {
        await tx.bookingParticipant.create({
          data: {
            bookingId: row.matchBookingId,
            name,
            gender,
            age,
            ageBand,
          },
        });
        const booking = await tx.booking.findUniqueOrThrow({
          where: { id: row.matchBookingId },
          include: { participants: true },
        });
        if (booking.participants.length > booking.groupSize) {
          await tx.booking.update({
            where: { id: booking.id },
            data: { groupSize: booking.participants.length },
          });
        }
        attached += 1;
        continue;
      }

      // CREATE_BOOKING — use operator user as placeholder holder for import seats
      const email =
        row.email?.trim().toLowerCase() ||
        `import+${Date.now()}-${created}@bhraman.local`;

      let user = await tx.user.findUnique({ where: { email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name,
            role: UserRole.TRAVELER,
          },
        });
      }

      const pricePerHead = slot.priceOverride ?? slot.listing.basePrice;
      const booking = await tx.booking.create({
        data: {
          bookingRef: bookingRef(),
          userId: user.id,
          listingId: slot.listing.id,
          slotId: slot.id,
          groupSize: 1,
          pricePerHead,
          totalAmount: pricePerHead,
          listingTitleSnapshot: slot.listing.title,
          startTimeSnapshot: slot.startTime,
          customerEmail: row.email?.trim() || user.email,
          customerPhone: row.phone?.trim() || null,
          customerGender: gender,
          emergencyContactName: row.emergencyName?.trim() || null,
          emergencyContactPhone: row.emergencyPhone?.trim() || null,
          medicalNotes: row.medicalNotes?.trim() || null,
          source: "OPERATOR_IMPORT",
          status: "CONFIRMED",
          participants: {
            create: {
              name,
              gender,
              age,
              ageBand,
            },
          },
        },
      });

      // Placeholder payment so escrow UI doesn't break
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: pricePerHead,
          razorpayOrderId: `import_order_${booking.id}`,
          status: "CAPTURED",
          escrowStatus: "HELD",
          heldAt: new Date(),
        },
      });

      created += 1;
    }

    await recomputeSlotComposition(slotId, tx);
  });

  // Silence unused — operatorUserId reserved for future audit
  void operatorUserId;

  return { created, attached, skipped: preview.filter((p) => p.action === "SKIP").length };
}
