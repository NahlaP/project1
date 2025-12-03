// // local fine



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

type AuthedReq = Request & { user?: { userId: string; email?: string } };

const EMAIL_ACCOUNT_LIMIT = Number(process.env.EMAIL_ACCOUNT_LIMIT || 10);
// total quota in MB (for the GB meter)
const EMAIL_STORAGE_LIMIT_MB = Number(
  process.env.EMAIL_STORAGE_LIMIT_MB || 5120
);

function toNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// 🔹 MAIN ONE: used by dashboard widget
export async function getEmailSummary(req: AuthedReq, res: Response) {
  try {
    // 🔍 Debug: see what user is attached (like domain can ignore it,
    // but we log it to confirm requireAuth worked)
    console.log("[Email] getEmailSummary user:", req.user);

    // 🚫 DO NOT do `if (!req.user) 401` here.
    // Authentication is already enforced by requireAuth in routes.

    // ---------------- Accounts ----------------
    const popsRes = await cpanelUapi("Email", "list_pops_with_disk");
    console.log("[Email] list_pops_with_disk raw:", popsRes);

    const accounts: any[] = Array.isArray(popsRes?.data)
      ? popsRes.data
      : [];

    // ---------------- Lists (may fail) --------
    let lists: any[] = [];
    try {
      const listsRes = await cpanelUapi("Email", "list_lists");
      console.log("[Email] list_lists raw:", listsRes);
      lists = Array.isArray(listsRes?.data) ? listsRes.data : [];
    } catch (e) {
      console.warn("[Email] list_lists failed:", e);
    }

    // Sum up storage (MB)
    let totalUsedMb = 0;
    accounts.forEach((acc) => {
      let usedMb = toNumber(acc.diskused); // diskused is MB
      if (!usedMb && acc._diskused != null) {
        usedMb = toNumber(acc._diskused) / (1024 * 1024); // bytes → MB
      }
      totalUsedMb += usedMb;
    });

    const limitStorageMb = EMAIL_STORAGE_LIMIT_MB;
    const usedMb = totalUsedMb;
    const remainingStorageMb = Math.max(0, limitStorageMb - usedMb);

    const limitGb = limitStorageMb / 1024;
    const usedGb = usedMb / 1024;
    const remainingGb = Math.max(0, limitGb - usedGb);

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
          // GB values for widget
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

export async function getEmailAccounts(req: AuthedReq, res: Response) {
  try {
    console.log("[Email] getEmailAccounts user:", req.user);

    // No extra 401 here either – routes already have requireAuth

    const popsRes = await cpanelUapi("Email", "list_pops_with_disk");
    const accounts: any[] = Array.isArray(popsRes?.data)
      ? popsRes.data
      : [];

    res.json({ accounts });
  } catch (err) {
    console.error("[emailManager.controller] getEmailAccounts error", err);
    res.status(500).json({ error: "Failed to fetch email accounts" });
  }
}

export async function getEmailLists(req: AuthedReq, res: Response) {
  try {
    console.log("[Email] getEmailLists user:", req.user);

    const listsRes = await cpanelUapi("Email", "list_lists");
    const lists: any[] = Array.isArray(listsRes?.data)
      ? listsRes.data
      : [];

    res.json({ lists });
  } catch (err) {
    console.error("[emailManager.controller] getEmailLists error", err);
    res.status(500).json({ error: "Failed to fetch email lists" });
  }
}
