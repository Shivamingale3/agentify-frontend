import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import Logo from "@/components/ui/logo";

export const metadata = {
  title: "Reset password",
  description: "Choose a new password for your Agentify account.",
};

/**
 * Target of the link in the reset-password email:
 * `${FRONTEND_URL}/reset-password/<token>`.
 */
export default async function ResetPassword({
  params,
}: PageProps<"/reset-password/[token]">) {
  const { token } = await params;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-1 text-center">
        <Logo mode="landscape" size="xl" />
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}
