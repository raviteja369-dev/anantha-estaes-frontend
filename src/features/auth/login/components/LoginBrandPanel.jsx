import LoginLogo from './LoginLogo'

export default function LoginBrandPanel() {
  return (
    <aside className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-slate-900">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(145deg,#0f172a_0%,#1e1b4b_45%,#0f172a_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(ellipse_at_20%_0%,#6366f1_0%,transparent_55%),radial-gradient(ellipse_at_80%_100%,#4f46e5_0%,transparent_50%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[32px_32px]"
      />

      <div className="relative z-10 p-10 xl:p-14">
        <LoginLogo variant="dark" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
        <h1 className="font-display max-w-md text-3xl xl:text-[2rem] font-semibold leading-tight tracking-tight text-white">
          Real estate operations, unified.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
          Secure access to projects, plot layouts, sales, payments, and team management — all in one workspace.
        </p>
      </div>

      <div className="relative z-10 border-t border-white/10 px-10 xl:px-14 py-6">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Anantha Estates · Authorized personnel only
        </p>
      </div>
    </aside>
  )
}
