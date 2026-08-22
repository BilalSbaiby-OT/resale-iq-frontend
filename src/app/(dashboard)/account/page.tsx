"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { getMe, changePassword, deleteAccount, getActivity, exportData, getBillingPortal, issueApiKey, resendVerification, getPlans, createCheckout, connectTelegram, disconnectTelegram, testTelegramAlert } from "@/lib/api"
import { resolvePriceId } from "@/lib/pricing"
import { useAuthStore } from "@/lib/auth-store"
import type { User } from "@/types"
import Link from "next/link"
import { CreditCard, KeyRound, ScrollText, Database, Download, AlertTriangle, Lock, Mail, Trash2, UserPlus, LogIn, Terminal, Copy, Check, Bell } from "lucide-react"

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [logs, setLogs] = useState<Array<{ action: string; created_at: string }>>([])
  const [newPw, setNewPw] = useState(""); const [confirmPw, setConfirmPw] = useState("")
  const [pwMsg, setPwMsg] = useState(""); const [pwOk, setPwOk] = useState(false); const [deleteConfirm, setDeleteConfirm] = useState("")
  const [resendMsg, setResendMsg] = useState(""); const [resending, setResending] = useState(false)
  const [apiKey, setApiKey] = useState(""); const [apiMsg, setApiMsg] = useState(""); const [copied, setCopied] = useState(false)
  const [plansList, setPlansList] = useState<{ id: string; price_id?: string }[]>([])
  const [upgrading, setUpgrading] = useState("")
  const [tgChatId, setTgChatId] = useState("")
  const [tgMsg, setTgMsg] = useState("")
  const [tgBusy, setTgBusy] = useState(false)
  // Set when Stripe bounces the user back from an abandoned checkout. Read in
  // the initialiser rather than an effect so the banner is correct on first
  // paint and no setState fires during render.
  const [checkoutCancelled] = useState(
    () => typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("checkout") === "cancelled")
  const { logout } = useAuthStore()
  const ACTIVITY_ICON: Record<string, typeof KeyRound> = { login: LogIn, register: UserPlus, password_change: Lock, forgot_password: Mail, account_delete: Trash2, plan_change: CreditCard }
  const PLAN_STYLES = { free: "bg-blue-500/10 border-blue-500/30 text-blue-400", operator: "bg-emerald-500/12 border-emerald-500/30 text-emerald-400", power: "bg-amber-500/12 border-amber-500/30 text-amber-400" }

  useEffect(() => {
    // Strip the flag from the URL so a refresh or a shared link doesn't keep
    // re-announcing a cancellation that already happened. The VALUE is read in
    // useState's initialiser above, not set here — calling setState
    // synchronously inside an effect triggers a cascading render and is a lint
    // error (react-hooks/set-state-in-effect).
    if (typeof window !== "undefined" && checkoutCancelled) {
      const p = new URLSearchParams(window.location.search)
      p.delete("checkout")
      const qs = p.toString()
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""))
    }
    getMe().then(setUser)
    getActivity().then(d => setLogs(d.logs.slice(0, 20))).catch(() => {})
    getPlans().then(d => setPlansList(d.plans)).catch(() => {})
    // checkoutCancelled comes from useState's initialiser and has no setter, so
    // it is constant for the component's life — listing it satisfies
    // exhaustive-deps without causing the effect to re-run.
  }, [checkoutCancelled])

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId)
    try {
      const placeholder = planId === "operator" ? "__OPERATOR__" : "__POWER__"
      const priceId = resolvePriceId(placeholder, plansList)
      if (!priceId) { alert("Plans are still loading — try again in a moment."); return }
      const { checkout_url } = await createCheckout(priceId)
      window.location.href = checkout_url
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Could not start checkout")
    } finally { setUpgrading("") }
  }

  const handleChangePw = async () => {
    if (newPw.length < 8) { setPwOk(false); setPwMsg("Min 8 characters"); return }
    if (newPw !== confirmPw) { setPwOk(false); setPwMsg("Passwords do not match"); return }
    try { await changePassword(newPw); setPwOk(true); setPwMsg("Password updated"); setNewPw(""); setConfirmPw("") }
    catch (e: unknown) { setPwOk(false); setPwMsg(e instanceof Error ? e.message : "Error") }
  }

  const handlePortal = async () => {
    // Surface the backend's actual reason. Swallowing it behind a generic
    // "not available" made an account with no subscription look like a broken
    // integration — the portal works fine for anyone who actually checked out.
    try { const r = await getBillingPortal(); window.location.href = r.portal_url }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Could not open the billing portal") }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") { alert("Type DELETE to confirm"); return }
    try { await deleteAccount(); logout() } catch (e: unknown) { alert(e instanceof Error ? e.message : "Error") }
  }

  const handleIssueKey = async () => {
    setApiMsg("")
    try {
      const r = await issueApiKey()
      setApiKey(r.api_key)
      setApiMsg("Copy it now — it is not shown again. Issuing a new key revokes the old one.")
    } catch (e: unknown) {
      setApiMsg(e instanceof Error ? e.message : "Could not issue key")
    }
  }

  // Free unlocks are gated on a verified address, and registration only ever
  // sent the link once. Without this the user has no route to their unlocks.
  const handleResend = async () => {
    setResending(true); setResendMsg("")
    try {
      const r = await resendVerification()
      setResendMsg(r.message)
    } catch (e) {
      setResendMsg(e instanceof Error ? e.message : "Could not send right now. Try again shortly.")
    } finally { setResending(false) }
  }

  const handleCopyKey = async () => {
    try { await navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked */ }
  }

  const handleTgConnect = async () => {
    if (!tgChatId.trim()) { setTgMsg("Enter your Telegram chat ID"); return }
    setTgBusy(true); setTgMsg("")
    try { await connectTelegram(tgChatId.trim()); setTgMsg("Connected! We'll send you price drop alerts."); getMe().then(setUser) }
    catch (e) { setTgMsg(e instanceof Error ? e.message : "Connection failed") }
    finally { setTgBusy(false) }
  }

  const handleTgDisconnect = async () => {
    setTgBusy(true); setTgMsg("")
    try { await disconnectTelegram(); setTgMsg("Disconnected."); setTgChatId(""); getMe().then(setUser) }
    catch (e) { setTgMsg(e instanceof Error ? e.message : "Error") }
    finally { setTgBusy(false) }
  }

  const handleTgTest = async () => {
    setTgBusy(true); setTgMsg("")
    try { await testTelegramAlert(); setTgMsg("Test alert sent — check your Telegram!") }
    catch (e) { setTgMsg(e instanceof Error ? e.message : "Test failed") }
    finally { setTgBusy(false) }
  }

  const handleExport = async () => {
    try { const d = await exportData(); const b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "resale-iq-data.json"; a.click() }
    catch { alert("Export failed") }
  }

  return (
    <AppShell title="Account" subtitle="Plan, billing, password, and data">
      <div className="max-w-2xl flex flex-col gap-4">
        {checkoutCancelled && (
          <div className="flex items-center gap-3 bg-[#1a2030] border border-[#263147] rounded-xl px-4 py-3 text-[12.5px] text-[#8fa3c4]">
            <CreditCard size={15} className="text-[#8fa3c4] shrink-0" />
            <span>Checkout cancelled — you haven&rsquo;t been charged. Your plan is unchanged.</span>
          </div>
        )}
        {/* Plan */}
        <div className="bg-[#141820] border border-[#1e2535] rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2535]"><CreditCard size={14} className="text-[#8fa3c4]" /><span className="font-bold text-[13px]">Your Plan</span></div>
          <div className="p-5">
            <div className={`flex items-center justify-between p-4 rounded-xl border ${user ? PLAN_STYLES[user.plan] : "border-[#263147]"} mb-4`}>
              <div><div className="font-extrabold text-[20px]">{user?.plan === "operator" ? "Starter" : user?.plan === "power" ? "Pro" : user?.plan === "free" ? "Unpaid" : "—"}</div><div className="text-[12px] text-[#8fa3c4] mt-0.5">{user?.plan === "free" ? "Subscribe to unlock the full toolkit" : "Unlimited verdicts · all 100 signals"}</div></div>
              <div className="font-mono font-bold text-[22px]">{user?.plan === "operator" ? "€19/mo" : user?.plan === "power" ? "€49/mo" : "—"}</div>
            </div>
            {user?.plan === "free" ? (
              <div className="flex flex-col gap-2">
                <button onClick={() => handleUpgrade("operator")} disabled={!!upgrading} className="block w-full text-center bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-semibold text-[12.5px] py-3 rounded-lg hover:bg-emerald-400 hover:text-[#0B0D10] transition-colors disabled:opacity-50 cursor-pointer">{upgrading === "operator" ? "Redirecting to Stripe…" : "Upgrade to Starter — €19/mo"}</button>
                <button onClick={() => handleUpgrade("power")} disabled={!!upgrading} className="block w-full text-center bg-amber-500/10 border border-amber-500 text-amber-400 font-semibold text-[12.5px] py-3 rounded-lg hover:bg-amber-400 hover:text-[#0B0D10] transition-colors disabled:opacity-50 cursor-pointer">{upgrading === "power" ? "Redirecting to Stripe…" : "Upgrade to Pro — €49/mo"}</button>
              </div>
            ) : (
              <div><button onClick={handlePortal} className="w-full border border-blue-500/40 text-blue-400 font-semibold text-[12.5px] py-3 rounded-lg hover:bg-blue-500/10 transition-colors">Manage subscription</button>
              <p className="text-[11px] text-[#546380] text-center mt-2">Opens Stripe's secure customer portal — cancel anytime</p></div>
            )}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-[#141820] border border-[#1e2535] rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2535]"><KeyRound size={14} className="text-[#8fa3c4]" /><span className="font-bold text-[13px]">Change Password</span></div>
          <div className="p-5 flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-[#546380] block mb-1.5">New password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60" />
            </div>
            <div>
              <label className="text-[10px] text-[#546380] block mb-1.5">Confirm password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60" />
            </div>
            {pwMsg && <div className={`text-[12px] text-center ${pwOk ? "text-emerald-400" : "text-red-400"}`}>{pwMsg}</div>}
            <button onClick={handleChangePw} className="border border-blue-500/40 text-blue-400 font-semibold text-[12.5px] py-2.5 rounded-lg hover:bg-blue-500/10 transition-colors">Update password</button>
          </div>
        </div>

        {/* Email confirmation. Only rendered when actionable — a permanent
            "confirm your email" banner on a verified account is noise that
            trains people to ignore the real one. */}
        {user && user.email_verified === false && (
          <div className="bg-[#141820] border border-amber-500/30 rounded-xl p-5 mb-5">
            <div className="font-bold text-[14px] text-amber-400 mb-1">Confirm your email</div>
            <p className="text-[12.5px] text-[#8fa3c4] leading-5 mb-3">
              Your 10 free checks each month — buy-below price, sell price, sell-through and best
              sizes — need a confirmed address. We sent a link when you signed up.
              {" "}<b className="text-[#eef1f7]">Look in spam or junk first</b> — mail from{" "}
              <b className="text-[#eef1f7]">noreply@resaleiq.dev</b> often lands there, and
              marking it &ldquo;not junk&rdquo; keeps later emails out of it. If it never
              arrived or has expired, send a fresh one.
            </p>
            <button onClick={handleResend} disabled={resending}
              className="bg-amber-500/10 border border-amber-500 text-amber-400 font-semibold text-[12px] px-4 py-2 rounded-lg hover:bg-amber-400 hover:text-[#0B0D10] transition-colors disabled:opacity-50">
              {resending ? "Sending…" : "Resend confirmation email"}
            </button>
            {resendMsg && <p className="text-[11.5px] text-[#8fa3c4] mt-3">{resendMsg}</p>}
          </div>
        )}

        {/* REST API — Pro plan only. The endpoints and X-Api-Key auth already
            existed and worked, but there was no way for a paying customer to
            obtain a key: no UI, no docs. The €49 tier advertised "REST API
            access" that in practice required opening browser dev tools. */}
        {user?.plan === "power" && (
          <div className="bg-[#12151d] border border-[#1c2333] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2535]">
              <Terminal size={14} className="text-amber-400" />
              <span className="font-bold text-[13px]">REST API</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/12 border border-amber-500/30 text-amber-400">Pro</span>
            </div>
            <div className="p-4">
              <p className="text-[12.5px] text-[#8b99b8] mb-3">
                Query your data programmatically. Send your key as an <code className="text-emerald-400">X-Api-Key</code> header.
              </p>

              {apiKey ? (
                <div className="mb-3">
                  <div className="flex items-center gap-2 bg-[#0e1118] border border-[#232c42] rounded-lg px-3 py-2.5">
                    <code className="text-[12px] text-emerald-400 break-all flex-1">{apiKey}</code>
                    <button onClick={handleCopyKey} className="shrink-0 text-[#8b99b8] hover:text-[#eef1f7]" title="Copy">
                      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              ) : null}

              {apiMsg && (
                <p className={`text-[11.5px] mb-3 ${apiKey ? "text-amber-400" : "text-red-300"}`}>{apiMsg}</p>
              )}

              <button onClick={handleIssueKey}
                className="bg-[#1a2030] border border-[#232c42] hover:border-emerald-500/50 text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors">
                {apiKey ? "Regenerate key" : "Generate API key"}
              </button>

              <div className="mt-4 pt-4 border-t border-[#1e2535]">
                <p className="text-[11px] text-[#5b6b8c] mb-2">Example</p>
                <pre className="bg-[#0e1118] border border-[#232c42] rounded-lg p-3 text-[11px] text-[#8b99b8] overflow-x-auto"><code>{`curl https://resaleiq.dev/api/model-signals \\
  -H "X-Api-Key: YOUR_KEY"`}</code></pre>
                <p className="text-[11px] text-[#5b6b8c] mt-3">
                  Available: <code>/api/model-signals</code>, <code>/api/deals</code>, <code>/api/kpis</code>,{" "}
                  <code>/api/brands/rankings</code>, <code>/api/trends/summary</code>, <code>/api/watchlist</code>,{" "}
                  <code>/api/portfolio</code>. Rate limit 60 req/min.
                </p>
                <Link href="/api-docs" className="inline-block mt-2 text-[11.5px] text-emerald-400 hover:underline">
                  Full API documentation →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Telegram Alerts */}
        <div className="bg-[#141820] border border-[#1e2535] rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2535]"><Bell size={14} className="text-[#8fa3c4]" /><span className="font-bold text-[13px]">Telegram Alerts</span></div>
          <div className="p-5 flex flex-col gap-3">
            <p className="text-[12.5px] text-[#8fa3c4] leading-5">
              Get price drop alerts for your watchlist items directly in Telegram.
              Message <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">@userinfobot</a> on Telegram to find your chat ID.
            </p>
            {user?.telegram_chat_id ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/25 rounded-lg px-3 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[12px] text-emerald-400 font-mono flex-1">Connected · {user.telegram_chat_id}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleTgTest} disabled={tgBusy} className="flex-1 border border-blue-500/40 text-blue-400 font-semibold text-[12px] py-2 rounded-lg hover:bg-blue-500/10 transition-colors disabled:opacity-50">Send test alert</button>
                  <button onClick={handleTgDisconnect} disabled={tgBusy} className="flex-1 border border-red-500/30 text-red-400 font-semibold text-[12px] py-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50">Disconnect</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input value={tgChatId} onChange={e => setTgChatId(e.target.value)} placeholder="Your Telegram chat ID (e.g. 123456789)"
                  className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 font-mono text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
                <button onClick={handleTgConnect} disabled={tgBusy} className="border border-emerald-500/40 text-emerald-400 font-semibold text-[12.5px] py-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors disabled:opacity-50">{tgBusy ? "Connecting…" : "Connect Telegram"}</button>
              </div>
            )}
            {tgMsg && <div className="text-[12px] text-center text-[#8fa3c4]">{tgMsg}</div>}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-[#141820] border border-[#1e2535] rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2535]"><ScrollText size={14} className="text-[#8fa3c4]" /><span className="font-bold text-[13px]">Recent Activity</span></div>
          <div className="p-3 flex flex-col gap-1.5">
            {logs.length === 0 ? <div className="text-center py-4 text-[#546380] text-[12px]">No activity yet</div> :
              logs.map((l, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#1a2030] rounded-lg px-3 py-2">
                  {(() => { const Ico = ACTIVITY_ICON[l.action]; return Ico ? <Ico size={13} className="text-[#8fa3c4]" /> : <span className="text-[#546380]">•</span> })()}
                  <span className="flex-1 text-[12px] text-[#8fa3c4] capitalize">{l.action.replace(/_/g, " ")}</span>
                  <span className="font-mono text-[10px] text-[#546380]">{l.created_at?.slice(0, 16).replace("T", " ")}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* GDPR */}
        <div className="bg-[#141820] border border-[#1e2535] rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2535]"><Database size={14} className="text-[#8fa3c4]" /><span className="font-bold text-[13px]">Your Data (GDPR)</span></div>
          <div className="p-5 flex flex-col gap-3">
            <p className="text-[13px] text-[#8fa3c4]">Under GDPR Article 20, you have the right to receive a copy of all personal data we hold about you.</p>
            <button onClick={handleExport} className="flex items-center justify-center gap-2 border border-[#263147] text-[#8fa3c4] font-semibold text-[12.5px] py-2.5 rounded-lg hover:bg-[#1a2030] hover:text-[#e8ecf4] transition-colors"><Download size={14} /> Download my data (JSON)</button>
            <p className="text-[11px] text-[#546380]"><Link href="/privacy" className="text-[#8fa3c4] hover:text-[#e8ecf4]">Privacy Policy</Link> · <Link href="/terms" className="text-[#8fa3c4] hover:text-[#e8ecf4]">Terms of Service</Link></p>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-[#141820] border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-red-500/20"><AlertTriangle size={14} className="text-red-400" /><span className="font-bold text-[13px] text-red-400">Danger Zone</span></div>
          <div className="p-5 flex flex-col gap-3">
            <p className="text-[13px] text-[#8fa3c4]">Deleting your account is permanent and cannot be undone.</p>
            <div><label className="text-[10px] text-[#546380] block mb-1.5">Type <strong className="text-red-400">DELETE</strong> to confirm</label>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 font-mono text-[13px] text-[#e8ecf4] outline-none focus:border-red-500 mb-2" />
            <button onClick={handleDelete} className="w-full border border-red-500/40 text-red-400 font-semibold text-[12.5px] py-2.5 rounded-lg hover:bg-red-500/10 transition-colors">Delete my account</button></div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
