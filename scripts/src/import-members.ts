import { db, ownersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import Papa from "papaparse";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/19BoLs1ZHmSHFrO03bEKawj_is-DgFc88rM7QzH4aVMQ/export?format=csv";

const ADMIN_EMAIL = "bharathgundecha@gmail.com";

function firstNamePassword(name: string): string {
  // e.g. "Bharath Jain" → "Bharath", "Dr HARSHITH C S" → "Dr"
  return name.trim().split(/\s+/)[0] || "gems";
}

function parseAge(raw: string): number {
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 30 : num;
}

function extractCity(area: string): string {
  const parts = area.split(",");
  return parts[parts.length - 1].trim();
}

function parseCars(raw: string, other: string): string[] {
  const known = [
    "NEV","NEM","N3M","N3L","TiM","TiL","TiG","PuM","PuL","CeM","CeL",
    "HeL","HQL","HeM","ZSM","WeM","CoM","ByA3","ByE6","BySL","KE6","KCC",
    "HyK","HyC","Hi5","X400","BEV6","XE9","E20","E20+","REV","EQS4","EQB3",
  ];
  const cars: string[] = [];

  const rawCodes = raw.split(/[,/]/).map(s => s.trim()).filter(Boolean);
  for (const code of rawCodes) {
    if (known.includes(code)) {
      cars.push(code);
    } else if (code.length > 0 && code.toUpperCase() !== "NA") {
      cars.push(code.slice(0, 20));
    }
  }

  if (!cars.length && other && other.toUpperCase() !== "NA" && other.trim().length > 0) {
    cars.push(other.trim().slice(0, 20));
  }

  return cars.length ? cars : ["NEV"];
}

async function run() {
  console.log("📥 Fetching member data from Google Sheets...");
  const res = await fetch(SHEET_CSV_URL);
  const csvText = await res.text();

  const { data: rows } = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
  console.log(`📋 ${rows.length - 1} records found`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  // Pre-load existing records
  const existing = await db
    .select({ id: ownersTable.id, email: ownersTable.email })
    .from(ownersTable);
  const existingByEmail = new Map(existing.map(r => [r.email.toLowerCase(), r.id]));

  for (const row of rows.slice(1)) {
    const email = row[1]?.trim().toLowerCase();
    const name = row[2]?.trim();
    const age = parseAge(row[3] || "30");
    const phone = row[4]?.trim() || "";
    const whatsapp = row[5]?.trim() || phone;
    const telegram = row[6]?.trim() || "NA";
    const areaOfStay = row[7]?.trim() || "";
    const occupation = row[8]?.trim() || "";
    const vehicleNumber = row[9]?.trim() || "";
    const carCode = row[10]?.trim() || "";
    const otherCar = row[11]?.trim() || "";
    const variantColor = row[12]?.trim() || "";
    const purchaseMonthYear = row[13]?.trim() || "";
    const proofUrl = row[14]?.trim() || "";

    if (!email || !name) { skipped++; continue; }

    // username = email, password = first name of the member
    const username = email;
    const initialPassword = firstNamePassword(name);
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const role = email === ADMIN_EMAIL ? "admin" : "user";
    const city = extractCity(areaOfStay);
    const evCarsOwned = parseCars(carCode, otherCar);

    const existingId = existingByEmail.get(email);

    if (existingId) {
      // Update existing record: set email-as-username, first-name password, mustChangePassword
      await db.update(ownersTable)
        .set({
          username,
          passwordHash,
          mustChangePassword: true,
          role,
          updatedAt: new Date(),
        })
        .where(eq(ownersTable.id, existingId));
      console.log(`🔄 Updated: ${name} (${email}) [${role}] → password: ${initialPassword}`);
      updated++;
    } else {
      // Insert new record
      try {
        await db.insert(ownersTable).values({
          email,
          name,
          age,
          phoneNumber: phone,
          whatsappNumber: whatsapp,
          telegramId: telegram,
          areaOfStay,
          city,
          occupation,
          vehicleNumber,
          evCarsOwned,
          variantColor,
          otherCarModel: otherCar || null,
          purchaseMonthYear,
          proofOfOwnershipUrl: proofUrl || null,
          status: "approved",
          role,
          username,
          passwordHash,
          mustChangePassword: true,
          blogEnabled: true,
        });
        existingByEmail.set(email, -1);
        console.log(`✅ Inserted: ${name} (${email}) [${role}] → password: ${initialPassword}`);
        inserted++;
      } catch (err: any) {
        console.error(`❌ Failed: ${name} (${email}): ${err.message}`);
        skipped++;
      }
    }
  }

  // Keep admin role for admin email
  await db.update(ownersTable)
    .set({ role: "admin" })
    .where(eq(ownersTable.email, ADMIN_EMAIL));

  console.log(`\n🎉 Done! Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  console.log(`👑 ${ADMIN_EMAIL} is admin`);
  console.log(`🔑 All members: username=<their email>, initial password=<their first name>`);
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
