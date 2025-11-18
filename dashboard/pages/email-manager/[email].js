<<<<<<< HEAD
=======

>>>>>>> origin/design-work


// pages/email-manager/[email].js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";

const CPANEL_WEBMAIL = process.env.NEXT_PUBLIC_CPANEL_WEBMAIL || "https://mavsketch.com:2096";

export default function ManageEmailPage() {
  const router = useRouter();
  const { email } = router.query;


  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);
  useEffect(() => {
    const onResize = () => {
      const below = typeof window !== "undefined" ? window.innerWidth < 992 : false;
      setIsBelowLg(below);
      setSidebarOpen(!below);
    };
    onResize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState("success"); // "success" | "error"

  // mailbox data
  const [box, setBox] = useState(null);

  // form state
  const [password, setPassword] = useState("");
  const [quotaMB, setQuotaMB] = useState(0);
  const [unlimited, setUnlimited] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [outgoing, setOutgoing] = useState(false);
  const [login, setLogin] = useState(false);

 
  const [stayAfterSave, setStayAfterSave] = useState(false);

  const usedHuman = useMemo(() => {
    if (!box) return "0 MB";
    const v = Number(box.usedMB || 0);
    return v >= 1024 ? `${(v / 1024).toFixed(2)} GB` : `${v.toFixed(2)} MB`;
  }, [box]);

  async function load() {
    if (!email) return;
    setLoading(true);
    setFlash("");
    try {
      const r = await fetch(`/next-api/email/${encodeURIComponent(email)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to load");
      setBox(j);
      setQuotaMB(j.unlimited ? 0 : Number(j.quotaMB || 0));
      setUnlimited(!!j.unlimited);
      setIncoming(!!j?.suspended?.incoming);
      setOutgoing(!!j?.suspended?.outgoing);
      setLogin(!!j?.suspended?.login);
      setPassword("");
    } catch (e) {
      setFlash(e.message || String(e));
      setFlashType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [email]);

  async function save() {
    if (!email) return;
    setSaving(true);
    setFlash("");
    try {
      const payload = {
        quotaMB: Number(quotaMB || 0),
        unlimited,
        suspended: { incoming, outgoing, login },
      };
      if (String(password || "").trim()) payload.password = String(password).trim();

      const r = await fetch(`/next-api/email/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || j?.ok === false) {
        throw new Error(j?.errors?.join("; ") || j?.error || "Update failed");
      }

      if (stayAfterSave) {
       
        setFlash(`All of your changes to “${email}” are saved.`);
        setFlashType("success");
        await load();
      } else {
     
        router.push({
          pathname: "/email-manager",
          query: {
            flash: `All of your changes to “${email}” are saved.`,
            flashType: "success",
          },
        });
      }
    } catch (e) {
      const msg = e.message || String(e);
      if (stayAfterSave) {
        setFlash(msg);
        setFlashType("error");
      } else {
        router.push({
          pathname: "/email-manager",
          query: { flash: msg, flashType: "error" },
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!email) return;
    if (!confirm(`Delete ${email}?`)) return;
    setDeleting(true);
    setFlash("");
    try {
      const destroy = document.getElementById("destroyMail")?.checked ? 1 : 0;
      const r = await fetch(`/next-api/email/${encodeURIComponent(email)}?destroy=${destroy}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Delete failed");
    
      router.push({
        pathname: "/email-manager",
        query: {
          flash: `Deleted “${email}”.`,
          flashType: "success",
        },
      });
    } catch (e) {
      setFlash(e.message || String(e));
      setFlashType("error");
    } finally {
      setDeleting(false);
    }
  }

  const genPass = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
    let p = ""; for (let i = 0; i < 16; i++) p += alphabet[Math.floor(Math.random() * alphabet.length)];
    setPassword(p);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

      <main
        style={{
          flexGrow: 1,
          padding: "64px 20px 24px", 
          marginLeft: !isBelowLg && sidebarOpen ? 256 : 0,
          transition: "margin-left .25s ease",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => history.back()} style={{ ...btn, padding: "4px 10px" }}>← Go Back</button>
          <h1 style={{ marginBottom: 8, marginTop: 0 }}>Manage Email Account</h1>
        </div>
        <p style={{ color: "#667", marginTop: 0 }}>Use this page to manage the selected email account.</p>

        {/* cPanel-style flash inside this page */}
        {flash && (
          <div
            role="status"
            style={{
              margin: "12px 0 14px",
              borderRadius: 6,
              padding: "10px 12px",
              border: flashType === "success" ? "1px solid #8ed38e" : "1px solid #f3b1b1",
              background: flashType === "success" ? "#eaffea" : "#ffecec",
              color: flashType === "success" ? "#145214" : "#a42828",
              fontSize: 14,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <strong style={{ marginRight: 6 }}>
              {flashType === "success" ? "Success:" : "Error:"}
            </strong>
            <span>{flash}</span>
          </div>
        )}

        <div style={{ border: "1px solid #e1e5ea", borderRadius: 8, padding: 16, background: "#fff", maxWidth: 880 }}>
          {/* Account */}
          <section style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Manage an Email Account</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#334" }}>
              <div style={{ fontWeight: 700 }}>{email || "-"}</div>
              <a href={CPANEL_WEBMAIL} target="_blank" rel="noreferrer" style={linkBtnSmall}>Check Email</a>
            </div>
          </section>

          {/* Security */}
          <section style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Security</div>
            <div style={{ display: "flex", gap: 8, maxWidth: 520 }}>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password (leave blank to keep current)"
                style={input}
              />
              <button type="button" onClick={genPass} style={btn}>Generate</button>
            </div>
          </section>

          {/* Storage */}
          <section style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Storage</div>

            <div style={{ color: "#667", fontSize: 13, marginBottom: 8 }}>
              Current Storage Usage: <strong>{usedHuman}</strong>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, maxWidth: 420 }}>
              <label style={label}>
                Allocated Storage Space (MB)
                <input
                  type="number"
                  min="0"
                  disabled={unlimited}
                  value={unlimited ? 0 : quotaMB}
                  onChange={(e) => setQuotaMB(e.target.value)}
                  style={input}
                />
              </label>
              <label style={{ ...label, alignSelf: "end", display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
                Unlimited
              </label>
            </div>
          </section>

          {/* Restrictions */}
          <section style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Restrictions</div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={rowBetween}>
                <div>Receiving Incoming Mail</div>
                <label style={toggleLabel}>
                  <input type="checkbox" checked={incoming} onChange={(e)=>setIncoming(e.target.checked)} /> Suspend
                </label>
              </div>
              <div style={rowBetween}>
                <div>Sending Outgoing Email</div>
                <label style={toggleLabel}>
                  <input type="checkbox" checked={outgoing} onChange={(e)=>setOutgoing(e.target.checked)} /> Suspend
                </label>
              </div>
              <div style={rowBetween}>
                <div>Logging In</div>
                <label style={toggleLabel}>
                  <input type="checkbox" checked={login} onChange={(e)=>setLogin(e.target.checked)} /> Suspend
                </label>
              </div>
            </div>
          </section>

          {/* Stay + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#334", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={stayAfterSave}
                onChange={(e) => setStayAfterSave(e.target.checked)}
              />
              Stay on this page after I click <em>Update Email Settings</em>.
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
            <button type="button" onClick={save} disabled={saving || loading} style={{ ...btn, borderColor: "#22a06b", color: "#167a4f" }}>
              {saving ? "Saving…" : "Update Email Settings"}
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => router.push("/email-manager")} style={btn}>Go Back</button>
          </div>
        </div>

        {/* delete card */}
        <div style={{ border: "1px solid #f4c7a1", background: "#fff7ea", marginTop: 20, borderRadius: 8, padding: 16, maxWidth: 880 }}>
          <div style={{ fontWeight: 700, color: "#8a5b00", marginBottom: 8 }}>Delete Email Account</div>
          <div style={{ color: "#8a5b00", marginBottom: 10 }}>When you delete an email account, all of its data is permanently deleted.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b5200" }}>
              <input id="destroyMail" type="checkbox" /> Also delete mailbox files on disk
            </label>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={del} disabled={deleting} style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }}>
              {deleting ? "Deleting…" : "Delete Email Account"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* styles */
const btn = {
  display: "inline-block",
  padding: "6px 10px",
  border: "1px solid #9fc2f2",
  background: "#fff",
  color: "#1e66d0",
  borderRadius: 4,
  fontWeight: 600,
  fontSize: 12.5,
  cursor: "pointer",
  textDecoration: "none",
};
const linkBtnSmall = { ...btn, padding: "2px 8px", fontSize: 12, borderColor: "#cfd5df", color: "#334" };
const label = { fontSize: 13, color: "#2d3748", display: "grid", gap: 6 };
const input = { height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #d6dbe1", width: "100%" };
const rowBetween = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const toggleLabel = { display: "flex", alignItems: "center", gap: 8, color: "#334", fontSize: 13 };
