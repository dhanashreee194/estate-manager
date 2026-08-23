import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEFT: Branding */}
        <div className="flex flex-col justify-center text-white space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            🏗️ Estate Manager
          </h1>

          <p className="text-lg text-gray-300">
            Smart Construction & Real Estate ERP
          </p>

          <p className="text-sm text-gray-400 leading-relaxed">
            Manage projects, units, bookings, payments, expenses and profits —
            all from a single, powerful dashboard.
          </p>
        </div>

        {/* RIGHT: Auth Card */}
        <div className="bg-[#1c1c1c] rounded-xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
