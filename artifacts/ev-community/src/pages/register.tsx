import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterOwner } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCarModelLabel } from "@/lib/car-models";

const EV_CARS = [
  { code: "NEV", label: "Tata Nexon EV Prime" },
  { code: "NEM", label: "Tata Nexon EV Max" },
  { code: "N3M", label: "Tata Nexon EV 3.0 Mid Range" },
  { code: "N3L", label: "Tata Nexon EV 3.0 Long Range" },
  { code: "TiM", label: "Tata Tiago EV Mid Range" },
  { code: "TiL", label: "Tata Tiago EV Long Range" },
  { code: "TiG", label: "Tata Tigor EV" },
  { code: "PuM", label: "Tata Punch EV Mid Range" },
  { code: "PuL", label: "Tata Punch EV Long Range" },
  { code: "CeM", label: "Tata Curvv EV Mid Range" },
  { code: "CeL", label: "Tata Curvv EV Long Range" },
  { code: "HeL", label: "Tata Harrier EV Long Range" },
  { code: "HQL", label: "Tata Harrier EV QWD Long Range" },
  { code: "HeM", label: "Tata Harrier EV Mid Range" },
  { code: "ZSM", label: "MG ZS EV" },
  { code: "WeM", label: "MG Windsor EV" },
  { code: "CoM", label: "MG Comet EV" },
  { code: "ByA3", label: "BYD Atto 3" },
  { code: "ByE6", label: "BYD E6" },
  { code: "BySL", label: "BYD Sealion" },
  { code: "KE6", label: "Kia EV 6" },
  { code: "KCC", label: "Kia Carens Clavis EV" },
  { code: "HyK", label: "Hyundai Kona" },
  { code: "HyC", label: "Hyundai Creta EV" },
  { code: "Hi5", label: "Hyundai Ioniq 5" },
  { code: "X400", label: "Mahindra XUV400" },
  { code: "BEV6", label: "Mahindra BE6" },
  { code: "XE9", label: "Mahindra XEV9E" },
  { code: "E20", label: "Mahindra E2O" },
  { code: "E20+", label: "Mahindra E2O Plus" },
  { code: "REV", label: "Reva" },
  { code: "EQS4", label: "Mercedes Benz EQS450" },
  { code: "EQB3", label: "Mercedes Benz EQB300" },
  { code: "EVit", label: "Suzuki E Vitara" },
];

const step1Schema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Name required"),
  age: z.coerce.number().min(16).max(100),
  phoneNumber: z.string().min(10, "Valid phone required"),
  whatsappNumber: z.string().min(10, "Valid WhatsApp number required"),
  telegramId: z.string().min(1, "Enter Telegram ID or NA"),
  areaOfStay: z.string().min(3, "Enter area and city, e.g. Hanumanthnagar, Bengaluru"),
  occupation: z.string().min(2, "Occupation required"),
});

const step2Schema = z.object({
  vehicleNumber: z.string().min(4, "Vehicle number required"),
  evCarsOwned: z.array(z.string()).min(1, "Select at least one car"),
  variantColor: z.string().min(2, "Enter exact variant and colour"),
  otherCarModel: z.string().optional(),
  purchaseMonthYear: z.string().min(3, "Month and year required, e.g. January 2023"),
});

const step3Schema = z.object({
  proofOfOwnershipUrl: z.string().url("Enter a valid URL for your proof of ownership").or(z.literal("")).optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

const STEPS = ["Personal Details", "Vehicle Information", "Proof of Ownership"];

export default function Register() {
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [step2Data, setStep2Data] = useState<Step2 | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: { telegramId: "" } });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { evCarsOwned: [] } });
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema) });

  const registerMutation = useRegisterOwner({
    mutation: {
      onSuccess: () => {
        toast({ title: "Registration Submitted!", description: "We'll review your details and notify you once approved." });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({ title: "Registration Failed", description: err?.message || "Please try again.", variant: "destructive" });
      },
    },
  });

  const onStep1 = (data: Step1) => { setStep1Data(data); setStep(1); };
  const onStep2 = (data: Step2) => { setStep2Data(data); setStep(2); };
  const onStep3 = (data: Step3) => {
    if (!step1Data || !step2Data) return;
    registerMutation.mutate({
      data: { ...step1Data, ...step2Data, proofOfOwnershipUrl: data.proofOfOwnershipUrl || undefined },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <img src="/gems-logo.png" alt="GEMS" className="h-14 w-auto mx-auto mb-4" />
          <h1 className="text-4xl font-bold tracking-tight">Join GEMS</h1>
          <p className="text-muted-foreground mt-2">Gang of Electric Mobility & Sustainability — apply for membership below</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all",
                  i < step ? "bg-primary border-primary text-primary-foreground" :
                  i === step ? "border-primary text-primary bg-background" :
                  "border-muted-foreground/30 text-muted-foreground bg-background"
                )}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={cn("text-xs mt-1 font-medium", i === step ? "text-primary" : "text-muted-foreground")}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-0.5 w-16 mx-2 mb-5 transition-all", i < step ? "bg-primary" : "bg-muted-foreground/20")} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-2xl shadow-lg p-8">
          {step === 0 && (
            <Form {...form1}>
              <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form1.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Rahul Kumar" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form1.control} name="age" render={({ field }) => (
                    <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="30" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form1.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form1.control} name="phoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form1.control} name="whatsappNumber" render={({ field }) => (
                    <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form1.control} name="telegramId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram ID</FormLabel>
                    <FormControl><Input placeholder="@username or NA" {...field} /></FormControl>
                    <FormDescription>Write NA if you don't use Telegram</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form1.control} name="areaOfStay" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area of Stay with City</FormLabel>
                    <FormControl><Input placeholder="Hanumanthnagar, Bengaluru" {...field} /></FormControl>
                    <FormDescription>Format: Locality, City</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form1.control} name="occupation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you do for a living?</FormLabel>
                    <FormControl><Input placeholder="Doctor, Software Engineer, Business Owner..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" size="lg">Continue to Vehicle Details</Button>
              </form>
            </Form>
          )}

          {step === 1 && (
            <Form {...form2}>
              <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-5">
                <FormField control={form2.control} name="vehicleNumber" render={({ field }) => (
                  <FormItem><FormLabel>Vehicle Number</FormLabel><FormControl><Input placeholder="KA 01 AB 1234" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form2.control} name="evCarsOwned" render={() => (
                  <FormItem>
                    <FormLabel>Which Electric Car(s) Do You Own?</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                      {EV_CARS.map(car => (
                        <FormField key={car.code} control={form2.control} name="evCarsOwned" render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes(car.code)}
                                onCheckedChange={checked => {
                                  const current = field.value;
                                  field.onChange(checked ? [...current, car.code] : current.filter(c => c !== car.code));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-xs cursor-pointer">{car.label} <span className="text-muted-foreground">({car.code})</span></FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form2.watch("evCarsOwned").map(code => {
                        const car = EV_CARS.find(c => c.code === code);
                        return <Badge key={code} variant="secondary" className="text-xs">{car?.label || code}</Badge>;
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form2.control} name="variantColor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exact Variant with Colour</FormLabel>
                    <FormControl><Input placeholder="e.g. Nexon EV Max LR – Daytona Grey" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form2.control} name="otherCarModel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Car Model (if not listed above)</FormLabel>
                    <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form2.control} name="purchaseMonthYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month and Year of Car Purchase</FormLabel>
                    <FormControl><Input placeholder="January 2023" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                  <Button type="submit" className="flex-1">Continue to Proof</Button>
                </div>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...form3}>
              <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 border text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Proof of Ownership Required</p>
                  <p>Upload a photo of your Insurance Copy, RC Book, or a screenshot from the mParivahan App.</p>
                  <p>Your name and vehicle number must be visible. You may redact VIN/chassis details.</p>
                </div>

                <FormField control={form3.control} name="proofOfOwnershipUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proof of Ownership URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://drive.google.com/file/... or image hosting link"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload your document to Google Drive, Dropbox, or any image hosting and paste the link here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="bg-card border rounded-lg p-4 space-y-1 text-sm">
                  <p className="font-medium">Submission Summary</p>
                  <p className="text-muted-foreground">Name: {step1Data?.name}</p>
                  <p className="text-muted-foreground">Email: {step1Data?.email}</p>
                  <p className="text-muted-foreground">Vehicle: {step2Data?.vehicleNumber}</p>
                  <p className="text-muted-foreground">Cars: {step2Data?.evCarsOwned.map(getCarModelLabel).join(", ")}</p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" className="flex-1" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
