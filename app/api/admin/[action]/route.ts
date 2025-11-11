import { createAdminClient } from "@/lib/supabase/admin";
import type { NextRequest } from "next/server";

const supabaseAdmin = createAdminClient();

async function clearBucket(bucketName: string, folderPath: string) {
  try {
    console.log(`Clearing folder "${folderPath}" in bucket "${bucketName}"`);

    const { data: items, error } = await supabaseAdmin.storage
      .from(bucketName)
      .list(folderPath, { limit: 1000, recursive: true });

    if (error) throw error;
    if (!items || items.length === 0) {
      console.log(`No files found in folder "${folderPath}"`);
      return;
    }

    const pathsToRemove = items.map(item => item.name); // <- kluczowe
    const { data: removed, error: removeError } = await supabaseAdmin.storage
      .from(bucketName)
      .remove(pathsToRemove);

    if (removeError) throw removeError;
    console.log(`Removed items from folder "${folderPath}":`, removed);
  } catch (err) {
    console.error(`Failed to clear folder "${folderPath}" in bucket "${bucketName}":`, err);
  }
}




async function clearAllBuckets() {
  const foldersToClear = {
    media: "media",
    audio: "audio",
    backgrounds: "backgrounds"
  };

  for (const [bucketName, folderPath] of Object.entries(foldersToClear)) {
    console.log(`Clearing folder "${folderPath}" in bucket "${bucketName}"`);
    await clearBucket(bucketName, folderPath);
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ action: string }> }) {
  try {
    const resolvedParams = await context.params;
    const action = resolvedParams.action;

    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    if (action === "clearBuckets") {
      const buckets = ["media", "audio", "backgrounds"];
      for (const bucket of buckets) {
        console.log(`Emptying bucket "${bucket}"`);
        const { data, error } = await supabaseAdmin.storage.emptyBucket(bucket);
        if (error) {
          console.error(`Failed to empty bucket "${bucket}":`, error);
        } else {
          console.log(`Bucket "${bucket}" emptied successfully:`, data);
        }
      }
      return new Response(JSON.stringify({ message: "All buckets emptied." }), { status: 200 });
    }

    if (action === "clearTables") {
      const tables = ["screens", "users", "media"];
      for (const table of tables) {
        console.log(`Clearing table: ${table}`);
        await supabaseAdmin.from(table).delete().neq("id", 0);
      }
      return new Response(JSON.stringify({ message: "All tables cleared." }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: "Invalid action" }), { status: 400 });
  } catch (err) {
    console.error("Error in POST /api/admin/[action]:", err);
    return new Response(JSON.stringify({ message: "Error clearing data", error: (err as any).message }), { status: 500 });
  }
}