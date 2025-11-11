import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/client";

const supabaseAdmin = createAdminClient();

// Rekurencyjne czyszczenie bucketu
async function clearBucket(bucketName: string, path = "") {
  console.log(`Listing items in bucket "${bucketName}" at path "${path}"`);
  const { data: items, error } = await supabaseAdmin.storage.from(bucketName).list(path, { limit: 1000 });

  if (error) {
    console.error(`Error listing items in bucket "${bucketName}" at path "${path}":`, error);
    throw error;
  }

  console.log(`Found items in bucket "${bucketName}" at path "${path}":`, items);

  if (!items || items.length === 0) return;

  for (const item of items) {
    const fullPath = path ? `${path}/${item.name}` : item.name;

    if (item.type === "folder") {
      console.log(`Entering folder: ${fullPath}`);
      // rekurencyjnie czyść folder
      await clearBucket(bucketName, fullPath);
    } else if (item.type === "file") {
      console.log(`Removing from bucket "${bucketName}": [ '${fullPath}' ]`);
      const { data, error: removeError } = await supabaseAdmin.storage.from(bucketName).remove([fullPath]);
      if (removeError) {
        console.error(`Failed to remove file "${fullPath}" from bucket "${bucketName}":`, removeError);
      } else {
        console.log(`Removed files:`, data);
      }
    }
  }
}

// Czyści wszystkie buckety
async function clearAllBuckets() {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    console.error("Error listing buckets:", error);
    throw error;
  }
  if (!buckets) return;

  for (const bucket of buckets) {
    console.log(`Clearing bucket "${bucket.name}"`);
    await clearBucket(bucket.name);
  }
}

// Endpoint API
export async function POST(req: NextRequest, context: { params: Promise<{ action: string }> }) {
  try {
    const resolvedParams = await context.params;
    const action = resolvedParams.action;

    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    if (action === "clearBuckets") {
      await clearAllBuckets();
      return new Response(JSON.stringify({ message: "All bucket objects cleared." }), { status: 200 });
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
