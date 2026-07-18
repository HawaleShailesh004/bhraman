/**
 * Update operator user emails only (no full reseed).
 * Run: npm run db:operators
 */

import { PrismaClient } from "@prisma/client";
import { legacyOperatorEmail, operatorEmail } from "../src/lib/operator-emails";

const prisma = new PrismaClient();

async function main() {
  const operators = await prisma.operator.findMany({
    include: { user: true },
    orderBy: { businessName: "asc" },
  });

  let updated = 0;

  for (const op of operators) {
    const nextEmail = operatorEmail(op.businessName);
    const legacyEmail = legacyOperatorEmail(op.businessName);
    const current = op.user.email;

    if (current === nextEmail) {
      console.log(`  – ${op.businessName}: already ${nextEmail}`);
      continue;
    }

    if (current !== legacyEmail && current !== nextEmail) {
      console.warn(
        `  ⚠ ${op.businessName}: unexpected email "${current}" - updating to ${nextEmail}`,
      );
    }

    const clash = await prisma.user.findUnique({ where: { email: nextEmail } });
    if (clash && clash.id !== op.userId) {
      console.error(
        `  ✗ ${op.businessName}: ${nextEmail} already taken - skip`,
      );
      continue;
    }

    await prisma.user.update({
      where: { id: op.userId },
      data: { email: nextEmail, role: "OPERATOR" },
    });

    console.log(`  ✓ ${op.businessName}: ${current} → ${nextEmail}`);
    updated++;
  }

  console.log(
    `\n✅ Done: ${updated}/${operators.length} operator emails updated`,
  );
  console.log(
    `   Sign up / sign in with e.g. ${operatorEmail("Sahyadri Trails")}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
