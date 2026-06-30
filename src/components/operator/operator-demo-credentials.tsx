import Link from "next/link";
import {
  DEMO_OPERATOR_CREDENTIALS,
  PRIMARY_OPERATOR_EMAIL,
} from "@/lib/operator-emails";

export function OperatorDemoCredentialsCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] border border-forest/25 bg-[#EAF1EC] text-sm text-[#33433A] ${
        compact ? "px-3 py-2.5 space-y-1" : "px-4 py-3 space-y-2"
      }`}
    >
      <p
        className={`font-semibold text-forest ${compact ? "text-xs uppercase tracking-wide" : ""}`}
      >
        {compact ? "Demo operator login" : "Demo operator credentials"}
      </p>
      <div
        className={
          compact ? "text-xs space-y-0.5" : "space-y-1.5 font-mono text-[13px]"
        }
      >
        <p>
          <span className="text-mist font-sans font-medium">Email </span>
          <code className="bg-white/80 px-1.5 py-0.5 rounded break-all">
            {DEMO_OPERATOR_CREDENTIALS.email}
          </code>
        </p>
        <p>
          <span className="text-mist font-sans font-medium">Password </span>
          <code className="bg-white/80 px-1.5 py-0.5 rounded">
            {DEMO_OPERATOR_CREDENTIALS.password}
          </code>
        </p>
      </div>
      {!compact ? (
        <p className="text-xs text-mist pt-0.5">
          First visit?{" "}
          <Link
            href="/operator/sign-up"
            className="font-semibold text-amber-deep hover:underline"
          >
            Sign up once
          </Link>{" "}
          with this email, then sign in. Verification code{" "}
          <code className="bg-white/80 px-1 rounded">424242</code> if Clerk asks.
        </p>
      ) : null}
    </div>
  );
}

export { PRIMARY_OPERATOR_EMAIL, DEMO_OPERATOR_CREDENTIALS };
