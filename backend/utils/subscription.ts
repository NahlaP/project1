

// export function needsPlan(status: string | null | undefined) {
//   return status !== "active";
// }







// backend/utils/subscription.ts
import { SubState } from "../services/subscription.state";

export function needsPlan(status?: SubState | null) {
  // if status is missing, treat as needing plan
  if (!status) return true;
  // only "none" or "incomplete" need plan
  return status === "none" || status === "incomplete";
}
