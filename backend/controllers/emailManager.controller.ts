// local fine



// // backend/controllers/emailManager.controller.ts
// import { Request, Response } from "express";
// import { cpanelUapi } from "../utils/cpanel";

// type AuthedReq = Request & { user?: { userId: string; email?: string } };

// const EMAIL_ACCOUNT_LIMIT = Number(process.env.EMAIL_ACCOUNT_LIMIT || 10);
// // total quota in MB (for the GB meter)
// const EMAIL_STORAGE_LIMIT_MB = Number(process.env.EMAIL_STORAGE_LIMIT_MB || 5120);

// function toNumber(value: any): number {
//   const n = Number(value);
//   return Number.isFinite(n) ? n : 0;
// }

// export async function getEmailSummary(req: AuthedReq, res: Response) {
//   try {
//     if (!req.user?.userId) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     // ---------------- Accounts ----------------
//     const popsRes = await cpanelUapi("Email", "list_pops_with_disk");
//     console.log("[Email] list_pops_with_disk raw:", popsRes);

//     const accounts: any[] = Array.isArray(popsRes?.data) ? popsRes.data : [];

//     // ---------------- Lists (may fail) --------
//     let lists: any[] = [];
//     try {
//       const listsRes = await cpanelUapi("Email", "list_lists");
//       console.log("[Email] list_lists raw:", listsRes);
//       lists = Array.isArray(listsRes?.data) ? listsRes.data : [];
//     } catch (e) {
//       console.warn("[Email] list_lists failed:", e);
//     }

//     // Sum up storage. In the cPanel response:
//     // - diskused  = MB (as string)
//     // - _diskused = bytes
//     let totalUsedMb = 0;
//     accounts.forEach((acc) => {
//       // Prefer diskused (MB). Fallback to _diskused (bytes) if needed.
//       let usedMb = toNumber(acc.diskused);
//       if (!usedMb && acc._diskused != null) {
//         usedMb = toNumber(acc._diskused) / (1024 * 1024);
//       }
//       totalUsedMb += usedMb;
//     });

//     // ---- Storage math (MB + GB + remaining) ----
//     const limitStorageMb = EMAIL_STORAGE_LIMIT_MB;
//     const usedMb = totalUsedMb;
//     const remainingStorageMb = Math.max(0, limitStorageMb - usedMb);

//     const limitGb = limitStorageMb / 1024;
//     const usedGb = usedMb / 1024;
//     const remainingGb = Math.max(0, limitGb - usedGb);

//     // ---- Accounts math ----
//     const limitAccounts = EMAIL_ACCOUNT_LIMIT;
//     const accountsUsed = accounts.length;
//     const accountsRemaining = Math.max(0, limitAccounts - accountsUsed);

//     return res.json({
//       summary: {
//         accounts: {
//           limit: limitAccounts,
//           used: accountsUsed,
//           remaining: accountsRemaining,
//         },
//         storage: {
//           // MB values
//           limitMb: Number(limitStorageMb.toFixed(2)),
//           usedMb: Number(usedMb.toFixed(2)),
//           remainingMb: Number(remainingStorageMb.toFixed(2)),
//           // GB values – these are what the dashboard donut should use
//           limitGb: Number(limitGb.toFixed(2)),
//           usedGb: Number(usedGb.toFixed(2)),
//           remainingGb: Number(remainingGb.toFixed(2)),
//         },
//       },
//       accounts,
//       lists,
//     });
//   } catch (err) {
//     console.error("[emailManager.controller] getEmailSummary error", err);
//     res.status(500).json({ error: "Failed to fetch email summary" });
//   }
// }

// export async function getEmailAccounts(req: AuthedReq, res: Response) {
//   try {
//     if (!req.user?.userId) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const popsRes = await cpanelUapi("Email", "list_pops_with_disk");
//     const accounts: any[] = Array.isArray(popsRes?.data) ? popsRes.data : [];

//     res.json({ accounts });
//   } catch (err) {
//     console.error("[emailManager.controller] getEmailAccounts error", err);
//     res.status(500).json({ error: "Failed to fetch email accounts" });
//   }
// }

// export async function getEmailLists(req: AuthedReq, res: Response) {
//   try {
//     if (!req.user?.userId) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const listsRes = await cpanelUapi("Email", "list_lists");
//     const lists: any[] = Array.isArray(listsRes?.data) ? listsRes.data : [];

//     res.json({ lists });
//   } catch (err) {
//     console.error("[emailManager.controller] getEmailLists error", err);
//     res.status(500).json({ error: "Failed to fetch email lists" });
//   }
// }









































// backend/controllers/emailManager.controller.ts
import { Request, Response } from "express";
import { cpanelUapi } from "../utils/cpanel";

const EMAIL_ACCOUNT_LIMIT = Number(process.env.EMAIL_ACCOUNT_LIMIT || 10);
// total quota in MB (for the GB meter)
const EMAIL_STORAGE_LIMIT_MB = Number(
  process.env.EMAIL_STORAGE_LIMIT_MB || 5120
);

function toNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function getEmailSummary(req: Request, res: Response) {
  try {
    // 🔍 mirror dashboard style
    const user: any = (req as any).user || {};
    const userId = user.id || user.userId;
    console.log("[Email] getEmailSummary user =", userId, user);

    // ❌ DO NOT 401 here – requireAuth already did that.
    // if (!userId) { ... }  <-- removed

    // ---------------- Accounts ----------------
    const popsRes = await cpanelUapi("Email", "list_pops_with_disk");
    console.log("[Email] list_pops_with_disk raw:", popsRes);

    const accounts: any[] = Array.isArray(popsRes?.data) ? popsRes.data : [];

    // ---------------- Lists (may fail) --------
    let lists: any[] = [];
    try {
      const listsRes = await cpanelUapi("Email", "list_lists");
      console.log("[Email] list_lists raw:", listsRes);
      lists = Array.isArray(listsRes?.data) ? listsRes.data : [];
    } catch (e) {
      console.warn("[Email] list_lists failed:", e);
    }

    // Sum up storage. In the cPanel response:
    // - diskused  = MB (as string)
    // - _diskused = bytes
    let totalUsedMb = 0;
    accounts.forEach((acc) => {
      let usedMb = toNumber(acc.diskused); // MB
      if (!usedMb && acc._diskused != null) {
        usedMb = toNumber(acc._diskused) / (1024 * 1024); // bytes → MB
      }
      totalUsedMb += usedMb;
    });

    // ---- Storage math (MB + GB + remaining) ----
    const limitStorageMb = EMAIL_STORAGE_LIMIT_MB;
    const usedMb = totalUsedMb;
    const remainingStorageMb = Math.max(0, limitStorageMb - usedMb);

    const limitGb = limitStorageMb / 1024;
    const usedGb = usedMb / 1024;
    const remainingGb = Math.max(0, limitGb - usedGb);

    // ---- Accounts math ----
    const limitAccounts = EMAIL_ACCOUNT_LIMIT;
    const accountsUsed = accounts.length;
    const accountsRemaining = Math.max(0, limitAccounts - accountsUsed);

    return res.json({
      summary: {
        accounts: {
          limit: limitAccounts,
          used: accountsUsed,
          remaining: accountsRemaining,
        },
        storage: {
          // MB values
          limitMb: Number(limitStorageMb.toFixed(2)),
          usedMb: Number(usedMb.toFixed(2)),
          remainingMb: Number(remainingStorageMb.toFixed(2)),
          // GB values – these are what the dashboard donut should use
          limitGb: Number(limitGb.toFixed(2)),
          usedGb: Number(usedGb.toFixed(2)),
          remainingGb: Number(remainingGb.toFixed(2)),
        },
      },
      accounts,
      lists,
    });
  } catch (err) {
    console.error("[emailManager.controller] getEmailSummary error", err);
    res.status(500).json({ error: "Failed to fetch email summary" });
  }
}

export async function getEmailAccounts(req: Request, res: Response) {
  try {
    const user: any = (req as any).user || {};
    const userId = user.id || user.userId;
    console.log("[Email] getEmailAccounts user =", userId);

    const popsRes = await cpanelUapi("Email", "list_pops_with_disk");
    const accounts: any[] = Array.isArray(popsRes?.data) ? popsRes.data : [];

    res.json({ accounts });
  } catch (err) {
    console.error("[emailManager.controller] getEmailAccounts error", err);
    res.status(500).json({ error: "Failed to fetch email accounts" });
  }
}

export async function getEmailLists(req: Request, res: Response) {
  try {
    const user: any = (req as any).user || {};
    const userId = user.id || user.userId;
    console.log("[Email] getEmailLists user =", userId);

    const listsRes = await cpanelUapi("Email", "list_lists");
    const lists: any[] = Array.isArray(listsRes?.data) ? listsRes.data : [];

    res.json({ lists });
  } catch (err) {
    console.error("[emailManager.controller] getEmailLists error", err);
    res.status(500).json({ error: "Failed to fetch email lists" });
  }
}
