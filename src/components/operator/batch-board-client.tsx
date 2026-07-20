"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SlotStatus, TripUpdateType } from "@prisma/client";
import type {
  OperatorBatchDetail,
  OperatorGuideRow,
  OperatorVehicleRow,
  ImportPreviewRow,
} from "@/types/batch";

const STATUSES: SlotStatus[] = [
  "OPEN",
  "FILLING_FAST",
  "CONFIRMED",
  "FULL",
  "CANCELLED",
  "COMPLETED",
];

const UPDATE_TYPES: TripUpdateType[] = [
  "INFO",
  "LOGISTICS",
  "WEATHER",
  "URGENT",
];

export function BatchBoardClient({
  initial,
  guides,
  vehicles,
}: {
  initial: OperatorBatchDetail;
  guides: OperatorGuideRow[];
  vehicles: OperatorVehicleRow[];
}) {
  const router = useRouter();
  const [batch, setBatch] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meetingPoint, setMeetingPoint] = useState(
    batch.meetingPointOverride ?? "",
  );
  const [pickupNote, setPickupNote] = useState(batch.pickupNote ?? "");
  const [weatherNote, setWeatherNote] = useState(batch.weatherNote ?? "");
  const [capacity, setCapacity] = useState(batch.capacity);
  const [minSeats, setMinSeats] = useState(batch.minSeatsToConfirm ?? "");
  const [status, setStatus] = useState<SlotStatus>(batch.status);
  const [guideId, setGuideId] = useState(batch.assignedGuideId ?? "");
  const [vehicleId, setVehicleId] = useState(batch.assignedVehicleId ?? "");
  const [startLocal, setStartLocal] = useState(toLocalInput(batch.startTime));
  const [endLocal, setEndLocal] = useState(toLocalInput(batch.endTime));

  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [updateType, setUpdateType] = useState<TripUpdateType>("INFO");

  const [importText, setImportText] = useState("");
  const [preview, setPreview] = useState<ImportPreviewRow[] | null>(null);

  async function refresh() {
    const res = await fetch(`/api/operator/slots/${batch.id}`);
    if (res.ok) {
      const data = (await res.json()) as OperatorBatchDetail;
      setBatch(data);
    }
    router.refresh();
  }

  async function saveLogistics() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/operator/slots/${batch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(startLocal).toISOString(),
          endTime: new Date(endLocal).toISOString(),
          capacity,
          minSeatsToConfirm:
            minSeats === "" ? null : Number.parseInt(String(minSeats), 10),
          status,
          meetingPointOverride: meetingPoint.trim() || null,
          pickupNote: pickupNote.trim() || null,
          weatherNote: weatherNote.trim() || null,
          assignedGuideId: guideId || null,
          assignedVehicleId: vehicleId || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function postUpdate() {
    if (!updateTitle.trim() || !updateBody.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/operator/slots/${batch.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateTitle,
          body: updateBody,
          type: updateType,
        }),
      });
      if (!res.ok) throw new Error("Could not post update");
      setUpdateTitle("");
      setUpdateBody("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Post failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteUpdate(updateId: string) {
    setBusy(true);
    try {
      await fetch(`/api/operator/slots/${batch.id}/updates`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function runImport(commit: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/operator/slots/${batch.id}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: importText, commit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      if (!commit) {
        setPreview(data.preview as ImportPreviewRow[]);
      } else {
        setPreview(null);
        setImportText("");
        await refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-[12px] border border-clay/30 bg-[#FFF7F5] px-4 py-3 text-sm text-clay">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-[16px] border border-line bg-white p-5 lg:grid-cols-4">
        <Stat label="Booked" value={`${batch.bookedSeats}/${batch.capacity}`} />
        <Stat
          label="Mix"
          value={`${batch.femaleCount}F · ${batch.maleCount}M · ${batch.otherCount}O`}
        />
        <Stat label="Status" value={batch.status.replaceAll("_", " ")} />
        <Stat label="Bookings" value={String(batch.bookings.length)} />
      </section>

      <section className="rounded-[16px] border border-line bg-white p-5">
        <h3 className="font-display text-lg font-medium tracking-tight">
          Timings & logistics
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Start">
            <input
              type="datetime-local"
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
            />
          </Field>
          <Field label="End">
            <input
              type="datetime-local"
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
            />
          </Field>
          <Field label="Capacity">
            <input
              type="number"
              min={1}
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </Field>
          <Field label="Min seats to confirm">
            <input
              type="number"
              min={1}
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={minSeats}
              onChange={(e) => setMinSeats(e.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field label="Status">
            <select
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as SlotStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Guide">
            <select
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={guideId}
              onChange={(e) => setGuideId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.role})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vehicle">
            <select
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              <option value="">None</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.type} · {v.plate}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Meeting point override">
            <input
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder={batch.listingMeetingPoint ?? "Listing default"}
            />
          </Field>
          <Field label="Pickup note">
            <textarea
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              rows={2}
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
            />
          </Field>
          <Field label="Weather note">
            <textarea
              className="w-full rounded-[12px] border border-line px-3 py-2 text-sm"
              rows={2}
              value={weatherNote}
              onChange={(e) => setWeatherNote(e.target.value)}
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={saveLogistics}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper disabled:opacity-60"
        >
          Save logistics
        </button>
      </section>

      <section className="rounded-[16px] border border-line bg-white p-5">
        <h3 className="font-display text-lg font-medium tracking-tight">
          Roster
        </h3>
        <div className="mt-4 space-y-3">
          {batch.bookings.length === 0 ? (
            <p className="text-sm text-mist">No bookings on this batch yet.</p>
          ) : (
            batch.bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-[12px] border border-line px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">
                      {b.travelerName}{" "}
                      <span className="text-xs text-mist">
                        · {b.bookingRef} · {b.groupSize} seat
                        {b.groupSize === 1 ? "" : "s"}
                      </span>
                    </p>
                    <p className="text-xs text-mist">
                      {b.travelerEmail}
                      {b.customerPhone ? ` · ${b.customerPhone}` : ""}
                      {b.source === "OPERATOR_IMPORT" ? " · imported" : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                    {b.status}
                  </span>
                </div>
                {b.participants.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {b.participants.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-full bg-paper-2 px-2.5 py-1 text-xs text-ink"
                      >
                        {p.name}
                        {p.gender ? ` · ${p.gender.charAt(0)}` : ""}
                        {p.ageBand
                          ? ` · ${p.ageBand.replace("AGE_", "").replaceAll("_", "-")}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[16px] border border-line bg-white p-5">
        <h3 className="font-display text-lg font-medium tracking-tight">
          Bulk import
        </h3>
        <p className="mt-1 text-sm text-mist">
          Paste CSV/TSV with columns: name, gender, age, phone, email
          (header row optional).
        </p>
        <textarea
          className="mt-3 w-full rounded-[12px] border border-line px-3 py-2 font-mono text-xs"
          rows={6}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={"name,gender,age,phone,email\nAsha,F,28,98...,asha@..."}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !importText.trim()}
            onClick={() => runImport(false)}
            className="rounded-full border border-line px-4 py-2 text-sm font-bold"
          >
            Preview
          </button>
          <button
            type="button"
            disabled={busy || !preview?.some((p) => p.action !== "SKIP")}
            onClick={() => runImport(true)}
            className="rounded-full bg-amber px-4 py-2 text-sm font-bold text-amber-text"
          >
            Commit import
          </button>
        </div>
        {preview ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-mist">
                  <th className="py-1 pr-3">#</th>
                  <th className="py-1 pr-3">Name</th>
                  <th className="py-1 pr-3">Action</th>
                  <th className="py-1">Errors</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p) => (
                  <tr key={p.row} className="border-t border-line">
                    <td className="py-1.5 pr-3">{p.row}</td>
                    <td className="py-1.5 pr-3">{p.name}</td>
                    <td className="py-1.5 pr-3">{p.action}</td>
                    <td className="py-1.5 text-clay">
                      {p.errors.join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="rounded-[16px] border border-line bg-white p-5">
        <h3 className="font-display text-lg font-medium tracking-tight">
          Updates board
        </h3>
        <p className="mt-1 text-sm text-mist">
          Posted updates appear on every traveler&apos;s trip page for this
          batch.
        </p>
        <div className="mt-4 grid gap-3">
          <input
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            placeholder="Title"
            value={updateTitle}
            onChange={(e) => setUpdateTitle(e.target.value)}
          />
          <textarea
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            rows={3}
            placeholder="Message for the batch…"
            value={updateBody}
            onChange={(e) => setUpdateBody(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-[12px] border border-line px-3 py-2 text-sm"
              value={updateType}
              onChange={(e) =>
                setUpdateType(e.target.value as TripUpdateType)
              }
            >
              {UPDATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy}
              onClick={postUpdate}
              className="rounded-full bg-amber px-5 py-2 text-sm font-bold text-amber-text"
            >
              Post update
            </button>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {batch.updates.map((u) => (
            <li
              key={u.id}
              className="rounded-[12px] border border-line px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-deep">
                    {u.type}
                    {u.pinned ? " · pinned" : ""}
                  </p>
                  <p className="mt-1 font-medium text-ink">{u.title}</p>
                  <p className="mt-1 text-sm text-body whitespace-pre-wrap">
                    {u.body}
                  </p>
                  <p className="mt-2 text-xs text-mist">
                    {new Date(u.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-clay"
                  onClick={() => deleteUpdate(u.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-mist">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-medium tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-mist">
        {label}
      </span>
      {children}
    </label>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
