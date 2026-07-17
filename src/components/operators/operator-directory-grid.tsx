"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { OperatorDirectoryCardData } from "@/types/listing";
import { listingImageStyle, operatorInitials } from "@/lib/ui-present";
import { brandEase, softSpring } from "@/lib/motion";
import {
  PaginationControls,
  useClientPagination,
} from "@/components/ui/pagination";

export function OperatorDirectoryGrid({
  operators,
}: {
  operators: OperatorDirectoryCardData[];
}) {
  const reduce = useReducedMotion();
  const pagination = useClientPagination(operators, 10);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {pagination.pageItems.map((operator, index) => (
        <motion.div
          key={operator.slug}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px" }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: 0.4,
                  delay: (index % 6) * 0.05,
                  ease: brandEase,
                }
          }
          whileHover={reduce ? undefined : { y: -4 }}
          whileTap={reduce ? undefined : { scale: 0.99 }}
        >
          <Link
            href={`/operators/${operator.slug}`}
            className="group block overflow-hidden rounded-lg border border-line bg-white shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]"
          >
            <div
              className="relative h-36 overflow-hidden sm:h-40"
              style={listingImageStyle("trekking", operator.coverImageUrl)}
              role="img"
              aria-label={`Trips by ${operator.businessName}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
              <motion.div
                className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-md border border-white/20 bg-forest font-display font-extrabold text-paper shadow-lg sm:h-12 sm:w-12"
                transition={softSpring}
                whileHover={reduce ? undefined : { scale: 1.05 }}
              >
                {operatorInitials(operator.businessName)}
              </motion.div>
              {operator.verificationStatus === "VERIFIED" ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber px-2.5 py-1 text-[10px] font-bold text-amber-text">
                  <BadgeCheck size={12} /> Verified
                </span>
              ) : null}
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="truncate font-display text-lg sm:text-xl">
                {operator.businessName}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-mist">
                <MapPin size={13} /> {operator.baseCity}
              </p>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-body-muted">
                {operator.bio}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {operator.yearsOperating !== null ? (
                  <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold">
                    {operator.yearsOperating}+ years
                  </span>
                ) : null}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    operator.insuranceStatus
                      ? "bg-[#EAF1EC] text-forest"
                      : "bg-paper-2 text-mist"
                  }`}
                >
                  <ShieldCheck size={12} />
                  {operator.insuranceStatus
                    ? "Insurance listed"
                    : "Insurance unverified"}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                <span className="text-mist">
                  {operator.activeListingCount} active trip
                  {operator.activeListingCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-bold text-amber-deep transition-transform duration-200 group-hover:translate-x-1">
                  View profile <ArrowRight size={15} />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
        ))}
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
    </div>
  );
}
