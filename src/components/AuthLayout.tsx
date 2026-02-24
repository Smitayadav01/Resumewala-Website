interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-slate-800 text-center">
          {title}
        </h2>
        <p className="text-slate-500 text-center mt-2 mb-6">
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
}