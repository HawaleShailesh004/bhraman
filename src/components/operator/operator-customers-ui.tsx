"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Repeat2, Search, UsersRound } from "lucide-react";
import type { OperatorCustomerRow } from "@/types/operator";
import {
  PaginationControls,
  useClientPagination,
} from "@/components/ui/pagination";

const GENDER_LABELS = {
  FEMALE: "Woman",
  MALE: "Man",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Not shared",
} as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function OperatorCustomersUi({
  customers,
}: {
  customers: OperatorCustomerRow[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [customers, query]);
  const pagination = useClientPagination(filtered, 10, query);
  const repeatCount = customers.filter(
    (customer) => customer.isRepeatCustomer,
  ).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-line bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-mist">
            <UsersRound size={15} className="text-forest" /> Completed customers
          </p>
          <p className="mt-2 font-display text-3xl">{customers.length}</p>
        </div>
        <div className="rounded-[14px] border border-line bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-mist">
            <Repeat2 size={15} className="text-amber-deep" /> Repeat customers
          </p>
          <p className="mt-2 font-display text-3xl">{repeatCount}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist"
        />
        <label htmlFor="customer-search" className="sr-only">
          Search customers
        </label>
        <input
          id="customer-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, or phone"
          className="inp bg-white pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-white p-10 text-center">
          <Search className="mx-auto text-mist" />
          <h2 className="mt-3 font-display text-lg">No matching customers</h2>
          <p className="mt-1 text-sm text-mist">
            Try a name, email address, or phone number.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {pagination.pageItems.map((customer, index) => (
              <motion.article
                key={customer.userId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[14px] border border-line bg-white p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-green to-forest text-xs font-bold text-white">
                    {initials(customer.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{customer.name}</h2>
                      {customer.isRepeatCustomer ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1EC] px-2 py-0.5 text-[10px] font-bold text-forest">
                          <Repeat2 size={11} /> Returning
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-mist">
                      {customer.completedBookings} completed trip
                      {customer.completedBookings === 1 ? "" : "s"} · Last{" "}
                      {formatDate(customer.lastTripAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 rounded-lg bg-paper p-3 text-sm">
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <Mail size={14} className="shrink-0 text-mist" />
                    <span className="truncate">{customer.email}</span>
                  </a>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-mist" />
                    {customer.phone ?? "Phone not captured"}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-md border border-line bg-white shadow-[var(--shadow-sm)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-line bg-paper-2">
                    {[
                      "Customer",
                      "Phone",
                      "Gender",
                      "Completed trips",
                      "Last trip",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-mist"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagination.pageItems.map((customer) => (
                    <tr
                      key={customer.userId}
                      className="border-b border-line transition-colors last:border-0 hover:bg-paper"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green to-forest text-[10px] font-bold text-white">
                            {initials(customer.name)}
                          </div>
                          <div>
                            <div className="font-semibold">{customer.name}</div>
                            <a
                              href={`mailto:${customer.email}`}
                              className="text-xs text-mist hover:text-ink"
                            >
                              {customer.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {customer.phone ?? "Not captured"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {customer.gender
                          ? GENDER_LABELS[customer.gender]
                          : "Not captured"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF1EC] px-2.5 py-1 text-xs font-bold text-forest">
                          {customer.isRepeatCustomer ? (
                            <Repeat2 size={13} />
                          ) : null}
                          {customer.completedBookings}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-[#54635A]">
                        {formatDate(customer.lastTripAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationControls
            total={pagination.total}
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalPages={pagination.totalPages}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.changePageSize}
          />
        </>
      )}
    </div>
  );
}
