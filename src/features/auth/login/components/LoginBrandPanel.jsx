import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import LoginLogo from './LoginLogo'

export default function LoginBrandPanel() {
  return (
    <aside className="relative hidden lg:flex lg:w-[46%] xl:w-1/2 flex-col justify-between overflow-hidden bg-[#0b1020] p-10 xl:p-14">
      {/* gradient mesh */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(155deg,#1e1b4b_0%,#0f172a_55%,#0b1020_100%)]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_60%_45%_at_15%_-5%,rgba(99,102,241,0.55),transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_105%,rgba(124,58,237,0.5),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_85%)]"
      />

      {/* floating geometric shapes */}
      <motion.div
        aria-hidden
        className="absolute right-16 top-28 h-24 w-24 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
        animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute right-40 bottom-40 h-16 w-16 rounded-full border border-white/10 bg-gradient-to-br from-indigo-400/30 to-violet-500/20 backdrop-blur-sm"
        animate={{ y: [0, 22, 0], x: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/3 h-10 w-10 rounded-xl border border-white/10 bg-white/5"
        animate={{ y: [0, -14, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* logo */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
        <LoginLogo variant="dark" size="md" />
      </motion.div>

      {/* headline + stats */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Enterprise Real Estate Suite
          </span>
          <h1 className="font-display max-w-lg text-[2.1rem] xl:text-[2.6rem] font-bold leading-[1.12] tracking-tight text-white">
            The smart way to manage{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              plots, projects & sales.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
            One elegant workspace for builders and real estate teams — layouts, inventory, customers, bookings and collections in real time.
          </p>
        </motion.div>
      </div>

      {/* footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 flex items-center gap-2 text-[12.5px] text-white/45"
      >
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        Bank-grade security · © {new Date().getFullYear()} Anantha Estates
      </motion.div>
    </aside>
  )
}
