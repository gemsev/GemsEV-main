import { useState } from "react";
import { useGetRangeCars, getGetRangeCarsQueryKey, useCalculateRange } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type DriveStyle = "eco" | "normal" | "sport";
type AcUsage = "off" | "low" | "high";
type Terrain = "flat" | "hilly" | "highway";

export default function Range() {
  const [carCode, setCarCode] = useState("");
  const [battery, setBattery] = useState(80);
  const [drivingStyle, setDrivingStyle] = useState<DriveStyle>("normal");
  const [acUsage, setAcUsage] = useState<AcUsage>("low");
  const [terrain, setTerrain] = useState<Terrain>("flat");
  const [result, setResult] = useState<any>(null);

  const { data: cars, isLoading } = useGetRangeCars({
    query: { queryKey: getGetRangeCarsQueryKey() }
  });

  const calculateMutation = useCalculateRange({
    mutation: {
      onSuccess: (data) => setResult(data),
    },
  });

  const selectedCar = cars?.find(c => c.code === carCode);

  function calculate() {
    if (!carCode) return;
    calculateMutation.mutate({
      data: { carCode, batteryPercentage: battery, drivingStyle, acUsage, terrainType: terrain },
    });
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Range Calculator</h1>
        <p className="text-muted-foreground">Estimate your EV's real-world range based on driving conditions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="bg-card border rounded-xl p-5">
            <label className="text-sm font-medium block mb-2">Select Your EV</label>
            <Select value={carCode} onValueChange={setCarCode}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : "Choose a car..."} />
              </SelectTrigger>
              <SelectContent>
                {cars?.map(car => (
                  <SelectItem key={car.code} value={car.code}>
                    {car.name} ({car.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCar && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Battery: {selectedCar.batteryCapacityKwh} kWh</span>
                <span>WLTP: {selectedCar.wltpRangeKm} km</span>
                <span>Real-world: {selectedCar.realWorldRangeKm} km</span>
                {selectedCar.chargingSpeedKw && <span>Max charge: {selectedCar.chargingSpeedKw} kW</span>}
              </div>
            )}
          </div>

          <div className="bg-card border rounded-xl p-5">
            <label className="text-sm font-medium block mb-3">Battery Level: {battery}%</label>
            <Slider
              value={[battery]}
              onValueChange={([v]) => setBattery(v)}
              min={5} max={100} step={5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-5 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Driving Style</label>
              <div className="flex gap-2">
                {(["eco", "normal", "sport"] as DriveStyle[]).map(s => (
                  <Button key={s} variant={drivingStyle === s ? "default" : "outline"} size="sm" className="flex-1 capitalize" onClick={() => setDrivingStyle(s)}>{s}</Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">AC Usage</label>
              <div className="flex gap-2">
                {(["off", "low", "high"] as AcUsage[]).map(s => (
                  <Button key={s} variant={acUsage === s ? "default" : "outline"} size="sm" className="flex-1 capitalize" onClick={() => setAcUsage(s)}>{s}</Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Terrain</label>
              <div className="flex gap-2">
                {(["flat", "hilly", "highway"] as Terrain[]).map(s => (
                  <Button key={s} variant={terrain === s ? "default" : "outline"} size="sm" className="flex-1 capitalize" onClick={() => setTerrain(s)}>{s}</Button>
                ))}
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={calculate} disabled={!carCode || calculateMutation.isPending}>
            {calculateMutation.isPending ? "Calculating..." : "Calculate Range"}
          </Button>
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <div className="bg-card border rounded-2xl p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">{result.carName}</p>
                <div className="text-7xl font-black text-primary mb-2">{result.estimatedRangeKm}</div>
                <p className="text-muted-foreground">estimated kilometres</p>
                <p className="text-xs text-muted-foreground mt-2">{result.batteryUsable} kWh available</p>
              </div>

              <div className="bg-card border rounded-xl p-5">
                <p className="text-sm font-medium mb-3">Efficiency Factors</p>
                <div className="space-y-2">
                  {[
                    { label: "Driving Style", value: result.factors.drivingStyleFactor },
                    { label: "AC Usage", value: result.factors.acFactor },
                    { label: "Terrain", value: result.factors.terrainFactor },
                    { label: "Temperature", value: result.factors.tempFactor },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <Badge variant={value >= 1 ? "default" : value >= 0.9 ? "secondary" : "destructive"} className="text-xs">
                        {(value * 100 - 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {result.tips && result.tips.length > 0 && (
                <div className="bg-card border rounded-xl p-5">
                  <p className="text-sm font-medium mb-3">Tips to Maximise Range</p>
                  <ul className="space-y-2">
                    {result.tips.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 border-2 border-dashed rounded-2xl h-full flex items-center justify-center text-center p-10">
              <div>
                <p className="text-lg font-medium text-muted-foreground">Select your car and conditions</p>
                <p className="text-sm text-muted-foreground mt-1">Your estimated range will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
