import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { OperatorDirectoryGrid } from "@/components/operators/operator-directory-grid";
import { TopoLines } from "@/components/ui/primitives";
import { getPublicOperators } from "@/lib/listings";

export const revalidate = 3600;

export default async function OperatorsPage() {
  const operators = await getPublicOperators();

  return (
    <main className="min-h-screen bg-paper">
      <Navbar onDark />
      <section className="relative overflow-hidden bg-ink pb-14 pt-28 text-paper sm:pb-20 sm:pt-36">
        <TopoLines opacity={0.1} />
        <div className="page-shell relative">
          <p className="eyebrow text-amber">Local experts, visible standards</p>
          <h1 className="max-w-3xl font-display text-[clamp(2rem,8vw,4.25rem)] font-black leading-[0.98]">
            Know who is leading your adventure.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-mast-sub sm:mt-5 sm:text-lg">
            Explore operator experience, safety signals, team details, and
            bookable trips before you decide.
          </p>
        </div>
      </section>

      <section className="page-shell py-10 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <div className="min-w-0">
            <p className="eyebrow">Operator directory</p>
            <h2 className="sec-title">Adventure teams on Bhraman</h2>
          </div>
          <p className="text-sm text-mist">
            {operators.length} active operator
            {operators.length === 1 ? "" : "s"}
          </p>
        </div>

        <OperatorDirectoryGrid operators={operators} />
      </section>
      <Footer />
    </main>
  );
}
