import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EmptyState, Panel } from "@/components/dashboard/Shell";
import { accommodationLevels, destinationLinks } from "@/data/site";

export const Route = createFileRoute("/_authenticated/admin/operations")({
  component: AdminOperations,
});

function AdminOperations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["ops"] });
  };

  const guides = useQuery({
    queryKey: ["ops", "guides"],
    queryFn: async () => (await supabase.from("guides").select("*").order("full_name")).data ?? [],
  });
  const vehicles = useQuery({
    queryKey: ["ops", "vehicles"],
    queryFn: async () => (await supabase.from("vehicles").select("*").order("name")).data ?? [],
  });
  const accommodations = useQuery({
    queryKey: ["ops", "accommodations"],
    queryFn: async () =>
      (await supabase.from("accommodations").select("*").order("name")).data ?? [],
  });

  const toggle = useMutation({
    mutationFn: async ({
      table,
      id,
      active,
    }: {
      table: "guides" | "vehicles" | "accommodations";
      id: string;
      active: boolean;
    }) => {
      const { error } = await supabase.from(table).update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const [guide, setGuide] = useState({ full_name: "", email: "", phone: "", languages: "" });
  const [vehicle, setVehicle] = useState({ name: "", vehicle_type: "", capacity: "6" });
  const [lodge, setLodge] = useState({ name: "", destination_slug: "", level: "Mid-range" });

  const addGuide = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("guides").insert({
        full_name: guide.full_name,
        email: guide.email || null,
        phone: guide.phone || null,
        languages: guide.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Guide added");
      setGuide({ full_name: "", email: "", phone: "", languages: "" });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addVehicle = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vehicles").insert({
        name: vehicle.name,
        vehicle_type: vehicle.vehicle_type || "4x4",
        capacity: Number(vehicle.capacity || 6),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle added");
      setVehicle({ name: "", vehicle_type: "", capacity: "6" });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addLodge = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("accommodations").insert({
        name: lodge.name,
        destination_slug: lodge.destination_slug,
        level: lodge.level,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Accommodation added");
      setLodge({ name: "", destination_slug: "", level: "Mid-range" });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="eyebrow">Operations</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
          Guides, vehicles & lodges
        </h1>
      </div>

      <Panel title="Guides">
        <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Full name"
            aria-label="Guide name"
            value={guide.full_name}
            onChange={(e) => setGuide({ ...guide, full_name: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            aria-label="Guide email"
            value={guide.email}
            onChange={(e) => setGuide({ ...guide, email: e.target.value })}
          />
          <Input
            placeholder="Phone"
            type="tel"
            aria-label="Guide phone"
            value={guide.phone}
            onChange={(e) => setGuide({ ...guide, phone: e.target.value })}
          />
          <Input
            placeholder="Languages, comma separated"
            aria-label="Guide languages"
            value={guide.languages}
            onChange={(e) => setGuide({ ...guide, languages: e.target.value })}
          />
          <Button variant="gold" onClick={() => addGuide.mutate()} disabled={!guide.full_name}>
            Add guide
          </Button>
        </div>
        {guides.data?.length ? (
          <ul className="divide-y divide-border">
            {guides.data.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">{g.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {g.email ?? "—"} · {g.phone ?? "—"} ·{" "}
                    {g.languages?.join(", ") || "languages TBC"}
                  </p>
                </div>
                <Switch
                  checked={g.active}
                  onCheckedChange={(v) => toggle.mutate({ table: "guides", id: g.id, active: v })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No guides yet." />
        )}
      </Panel>

      <Panel title="Vehicles">
        <div className="mb-5 grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Name"
            value={vehicle.name}
            onChange={(e) => setVehicle({ ...vehicle, name: e.target.value })}
          />
          <Input
            placeholder="Type"
            value={vehicle.vehicle_type}
            onChange={(e) => setVehicle({ ...vehicle, vehicle_type: e.target.value })}
          />
          <Input
            placeholder="Capacity"
            type="number"
            value={vehicle.capacity}
            onChange={(e) => setVehicle({ ...vehicle, capacity: e.target.value })}
          />
          <Button variant="gold" onClick={() => addVehicle.mutate()} disabled={!vehicle.name}>
            Add vehicle
          </Button>
        </div>
        {vehicles.data?.length ? (
          <ul className="divide-y divide-border">
            {vehicles.data.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">{v.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {v.vehicle_type} · {v.capacity} seats · {v.plate ?? "no plate"}
                  </p>
                </div>
                <Switch
                  checked={v.active}
                  onCheckedChange={(val) =>
                    toggle.mutate({ table: "vehicles", id: v.id, active: val })
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No vehicles yet." />
        )}
      </Panel>

      <Panel title="Accommodation">
        <div className="mb-5 grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Name"
            aria-label="Lodge name"
            value={lodge.name}
            onChange={(e) => setLodge({ ...lodge, name: e.target.value })}
          />
          <Select
            value={lodge.destination_slug}
            onValueChange={(v) => setLodge({ ...lodge, destination_slug: v })}
          >
            <SelectTrigger aria-label="Destination">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              {destinationLinks.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lodge.level} onValueChange={(v) => setLodge({ ...lodge, level: v })}>
            <SelectTrigger aria-label="Level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accommodationLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="gold"
            onClick={() => addLodge.mutate()}
            disabled={!lodge.name || !lodge.destination_slug}
          >
            Add lodge
          </Button>
        </div>
        {accommodations.data?.length ? (
          <ul className="divide-y divide-border">
            {accommodations.data.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">{a.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.destination_slug ?? "—"} · {a.level ?? "—"} · {a.city ?? "—"}
                  </p>
                </div>
                <Switch
                  checked={a.active}
                  onCheckedChange={(v) =>
                    toggle.mutate({ table: "accommodations", id: a.id, active: v })
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No accommodation yet." />
        )}
      </Panel>
    </div>
  );
}
