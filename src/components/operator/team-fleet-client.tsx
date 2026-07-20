"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OperatorGuideRow, OperatorVehicleRow } from "@/types/batch";

export function TeamFleetClient({
  initialGuides,
  initialVehicles,
}: {
  initialGuides: OperatorGuideRow[];
  initialVehicles: OperatorVehicleRow[];
}) {
  const router = useRouter();
  const [guides, setGuides] = useState(initialGuides);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [gRole, setGRole] = useState("Trek lead");
  const [gPublic, setGPublic] = useState(false);

  const [vType, setVType] = useState("");
  const [vPlate, setVPlate] = useState("");
  const [vCapacity, setVCapacity] = useState("");

  async function reload() {
    const [gRes, vRes] = await Promise.all([
      fetch("/api/operator/guides"),
      fetch("/api/operator/vehicles"),
    ]);
    if (gRes.ok) {
      const data = (await gRes.json()) as { guides: OperatorGuideRow[] };
      setGuides(data.guides);
    }
    if (vRes.ok) {
      const data = (await vRes.json()) as { vehicles: OperatorVehicleRow[] };
      setVehicles(data.vehicles);
    }
    router.refresh();
  }

  async function addGuide() {
    if (!gName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/operator/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: gName,
          phone: gPhone || null,
          role: gRole,
          phonePublic: gPublic,
        }),
      });
      if (!res.ok) throw new Error("Could not add guide");
      setGName("");
      setGPhone("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addVehicle() {
    if (!vType.trim() || !vPlate.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/operator/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: vType,
          plate: vPlate,
          capacity: vCapacity ? Number(vCapacity) : null,
        }),
      });
      if (!res.ok) throw new Error("Could not add vehicle");
      setVType("");
      setVPlate("");
      setVCapacity("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleGuide(id: string, active: boolean) {
    await fetch("/api/operator/guides", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    await reload();
  }

  async function toggleVehicle(id: string, active: boolean) {
    await fetch("/api/operator/vehicles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    await reload();
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-[12px] border border-clay/30 bg-[#FFF7F5] px-4 py-3 text-sm text-clay">
          {error}
        </p>
      ) : null}

      <section className="rounded-[16px] border border-line bg-white p-5">
        <h3 className="font-display text-lg font-medium">Guides</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            placeholder="Name"
            value={gName}
            onChange={(e) => setGName(e.target.value)}
          />
          <input
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            placeholder="Phone"
            value={gPhone}
            onChange={(e) => setGPhone(e.target.value)}
          />
          <input
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            placeholder="Role"
            value={gRole}
            onChange={(e) => setGRole(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={gPublic}
              onChange={(e) => setGPublic(e.target.checked)}
            />
            Show phone to travelers
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={addGuide}
          className="mt-3 rounded-full bg-ink px-5 py-2 text-sm font-bold text-paper"
        >
          Add guide
        </button>
        <ul className="mt-5 space-y-2">
          {guides.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium">{g.name}</span>
                <span className="text-mist">
                  {" "}
                  · {g.role}
                  {g.phone ? ` · ${g.phone}` : ""}
                  {g.phonePublic ? " · phone public" : ""}
                  {!g.active ? " · inactive" : ""}
                </span>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-amber-deep"
                onClick={() => toggleGuide(g.id, !g.active)}
              >
                {g.active ? "Deactivate" : "Activate"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[16px] border border-line bg-white p-5">
        <h3 className="font-display text-lg font-medium">Vehicles</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <input
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            placeholder="Type (Tempo, Innova…)"
            value={vType}
            onChange={(e) => setVType(e.target.value)}
          />
          <input
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            placeholder="Plate"
            value={vPlate}
            onChange={(e) => setVPlate(e.target.value)}
          />
          <input
            className="rounded-[12px] border border-line px-3 py-2 text-sm"
            placeholder="Capacity"
            value={vCapacity}
            onChange={(e) => setVCapacity(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={addVehicle}
          className="mt-3 rounded-full bg-ink px-5 py-2 text-sm font-bold text-paper"
        >
          Add vehicle
        </button>
        <ul className="mt-5 space-y-2">
          {vehicles.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium">
                  {v.type} · {v.plate}
                </span>
                <span className="text-mist">
                  {v.capacity ? ` · ${v.capacity} seats` : ""}
                  {!v.active ? " · inactive" : ""}
                </span>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-amber-deep"
                onClick={() => toggleVehicle(v.id, !v.active)}
              >
                {v.active ? "Deactivate" : "Activate"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
