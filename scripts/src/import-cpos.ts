import { db, cposTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import Papa from "papaparse";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1Rs3uqGPWp5BIFDCrRq7fJuNuUmld6HtGoIG06tpdh6M/export?format=csv&gid=0";

function cleanPhone(raw: string): string {
  // Remove unicode non-breaking spaces, invisible chars, etc.
  return raw.replace(/[^\d+]/g, "").trim();
}

function waLink(phone: string): string {
  return phone.replace(/\D/g, "");
}

async function run() {
  console.log("📥 Fetching CPO data from Google Sheets...");
  const res = await fetch(SHEET_CSV_URL);
  const csvText = await res.text();

  const { data: rows } = Papa.parse<string[]>(csvText, { skipEmptyLines: true });

  // Skip the title row (row 0) and header row (row 1)
  const dataRows = rows.slice(2);
  console.log(`📋 ${dataRows.length} CPO contact rows found`);

  // Clear existing CPO data and re-import fresh
  await db.delete(cposTable);
  console.log("🗑  Cleared existing CPO records");

  let inserted = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const networkName = row[0]?.trim();
    const contactPerson = row[1]?.trim() || null;
    const designation = row[2]?.trim() || null;
    const rawPhone = row[3]?.trim() || "";
    const email = row[4]?.trim() || null;
    // col 5 = availability note (WhatsApp Message / Call / etc.)
    const availability = row[5]?.trim() || null;

    if (!networkName) { skipped++; continue; }

    const phone = cleanPhone(rawPhone) || null;
    // Use same number for whatsapp (all contacts approved WhatsApp)
    const whatsapp = phone;

    const notes = availability && availability !== "WhatsApp Message" ? availability : null;

    try {
      await db.insert(cposTable).values({
        networkName,
        contactPerson,
        designation,
        email,
        phone,
        whatsapp,
        notes,
        chargerTypes: [],
      });
      console.log(`✅ ${networkName}${contactPerson ? ` — ${contactPerson}` : ""}${designation ? ` (${designation})` : ""}`);
      inserted++;
    } catch (err: any) {
      console.error(`❌ Failed: ${networkName}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
