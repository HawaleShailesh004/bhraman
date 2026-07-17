import { PosHStatus, VerificationStatus } from "@prisma/client";
import { getSessionOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type VerificationBody = {
  yearsOperating?: unknown;
  panNumber?: unknown;
  gstNumber?: unknown;
  mtdcRegistrationNo?: unknown;
  insuranceStatus?: unknown;
  insuranceProvider?: unknown;
  insuranceDetails?: unknown;
  femaleGuideCount?: unknown;
  totalGuideCount?: unknown;
  posHPolicyStatus?: unknown;
};

function optionalText(value: unknown, maxLength: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_PAYLOAD");
  return value.trim().slice(0, maxLength) || null;
}

export async function PATCH(request: Request) {
  const session = await getSessionOperator();
  if (!session) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json()) as VerificationBody;
  if (
    typeof body.insuranceStatus !== "boolean" ||
    typeof body.yearsOperating !== "number" ||
    !Number.isInteger(body.yearsOperating) ||
    body.yearsOperating < 0 ||
    body.yearsOperating > 100 ||
    typeof body.femaleGuideCount !== "number" ||
    !Number.isInteger(body.femaleGuideCount) ||
    body.femaleGuideCount < 0 ||
    typeof body.totalGuideCount !== "number" ||
    !Number.isInteger(body.totalGuideCount) ||
    body.totalGuideCount < body.femaleGuideCount ||
    !Object.values(PosHStatus).includes(
      body.posHPolicyStatus as PosHStatus,
    )
  ) {
    return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  try {
    const panNumber = optionalText(body.panNumber, 10)?.toUpperCase() ?? null;
    const gstNumber = optionalText(body.gstNumber, 15)?.toUpperCase() ?? null;
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      return Response.json({ error: "INVALID_PAN" }, { status: 400 });
    }
    if (
      gstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(gstNumber)
    ) {
      return Response.json({ error: "INVALID_GST" }, { status: 400 });
    }

    const current = await prisma.operator.findUniqueOrThrow({
      where: { id: session.operatorId },
      select: { verificationStatus: true },
    });
    const verificationStatus =
      current.verificationStatus === VerificationStatus.VERIFIED
        ? VerificationStatus.VERIFIED
        : VerificationStatus.PENDING;

    const operator = await prisma.operator.update({
      where: { id: session.operatorId },
      data: {
        yearsOperating: body.yearsOperating,
        panNumber,
        gstNumber,
        mtdcRegistrationNo: optionalText(body.mtdcRegistrationNo, 80),
        insuranceStatus: body.insuranceStatus,
        insuranceProvider: body.insuranceStatus
          ? optionalText(body.insuranceProvider, 120)
          : null,
        insuranceDetails: body.insuranceStatus
          ? optionalText(body.insuranceDetails, 1000)
          : null,
        femaleGuideCount: body.femaleGuideCount,
        totalGuideCount: body.totalGuideCount,
        posHPolicyStatus: body.posHPolicyStatus as PosHStatus,
        verificationStatus,
      },
      select: { verificationStatus: true },
    });

    return Response.json(operator);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PAYLOAD") {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    return Response.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
