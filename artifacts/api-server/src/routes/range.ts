import { Router } from "express";
import { db, evRangeSpecsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request } from "express";

const router = Router();

// GET /range/cars
router.get("/range/cars", async (req: Request, res) => {
  try {
    const cars = await db.select().from(evRangeSpecsTable).orderBy(evRangeSpecsTable.brand);
    return res.json(cars);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch EV specs" });
  }
});

// POST /range/calculate
router.post("/range/calculate", async (req: Request, res) => {
  try {
    const { carCode, batteryPercentage, drivingStyle, acUsage, terrainType, ambientTempCelsius } = req.body;

    const [car] = await db.select().from(evRangeSpecsTable).where(eq(evRangeSpecsTable.code, carCode)).limit(1);
    if (!car) return res.status(404).json({ error: "Car not found" });

    const baseRange = car.realWorldRangeKm;
    const batteryFraction = batteryPercentage / 100;

    // Driving style factors
    const drivingStyleFactors: Record<string, number> = { eco: 1.1, normal: 1.0, sport: 0.82 };
    const drivingStyleFactor = drivingStyleFactors[drivingStyle] || 1.0;

    // AC usage factors
    const acFactors: Record<string, number> = { off: 1.05, low: 0.95, high: 0.85 };
    const acFactor = acFactors[acUsage] || 1.0;

    // Terrain factors
    const terrainFactors: Record<string, number> = { flat: 1.0, hilly: 0.88, highway: 0.92 };
    const terrainFactor = terrainFactors[terrainType] || 1.0;

    // Temperature factor (optimal at 25°C)
    const temp = ambientTempCelsius ?? 25;
    let tempFactor = 1.0;
    if (temp < 10) tempFactor = 0.85;
    else if (temp < 20) tempFactor = 0.93;
    else if (temp > 40) tempFactor = 0.90;

    const estimatedRange = Math.round(
      baseRange * batteryFraction * drivingStyleFactor * acFactor * terrainFactor * tempFactor
    );

    const tips: string[] = [];
    if (drivingStyle === "sport") tips.push("Switch to Eco mode to gain up to 20% more range");
    if (acUsage === "high") tips.push("Reduce AC to Low or Off to save 10-15% range");
    if (terrainType === "hilly") tips.push("Use regenerative braking on descents to recover energy");
    if (temp < 15) tips.push("Cold weather reduces battery efficiency — pre-condition the battery while charging");
    if (batteryPercentage > 90) tips.push("For daily driving, keep battery between 20-80% for longevity");

    return res.json({
      estimatedRangeKm: estimatedRange,
      carName: car.name,
      batteryUsable: Math.round(car.batteryCapacityKwh * batteryFraction * 10) / 10,
      factors: { drivingStyleFactor, acFactor, terrainFactor, tempFactor },
      tips,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to calculate range" });
  }
});

export default router;
