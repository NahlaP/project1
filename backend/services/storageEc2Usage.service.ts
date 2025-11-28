// backend/services/storageEc2Usage.service.ts
import { exec } from "child_process";
import { promisify } from "util";

const pExec = promisify(exec);

export type Ec2DiskUsage = {
  sizeBytes: number;
  usedBytes: number;
  mount: string;
};

/**
 * Try to read EC2 disk usage (root volume) using `df`.
 * - Returns null on Windows / non-Linux or any error.
 * - Only intended for production EC2 (Linux).
 */
export async function getEc2DiskUsage(): Promise<Ec2DiskUsage | null> {
  // 🧠 Skip completely on non-Linux (Windows / mac local dev)
  if (process.platform !== "linux") {
    return null;
  }

  try {
    const { stdout } = await pExec(
      "df -k --output=size,used,target / | tail -1"
    );

    // Example line: "20971520 1048576 /"
    const parts = stdout.trim().split(/\s+/);
    if (parts.length < 3) {
      return null;
    }

    const sizeKb = parseInt(parts[0], 10) || 0;
    const usedKb = parseInt(parts[1], 10) || 0;
    const mount = parts[2] || "/";

    return {
      sizeBytes: sizeKb * 1024,
      usedBytes: usedKb * 1024,
      mount,
    };
  } catch (err) {
    console.error("[storageEc2Usage] failed to read EC2 disk usage", err);
    // ❗ Swallow the error and just return null so dashboard still works
    return null;
  }
}
