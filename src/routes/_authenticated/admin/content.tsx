import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState, Panel, money } from "@/components/dashboard/Shell";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: AdminContent,
});

type ContentTable = "destinations" | "packages" | "activities" | "blog_posts" | "testimonials";

function AdminContent() {
  const qc = useQueryClient();

  const content = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const [destinations, packages, activities, posts, testimonials] = await Promise.all([
        supabase.from("destinations").select("*").order("sort_order"),
        supabase.from("packages").select("*").order("sort_order"),
        supabase.from("activities").select("*").order("sort_order"),
        supabase.from("blog_posts").select("*").order("post_date", { ascending: false }),
        supabase.from("testimonials").select("*").order("sort_order"),
      ]);
      return {
        destinations: destinations.data ?? [],
        packages: packages.data ?? [],
        activities: activities.data ?? [],
        posts: posts.data ?? [],
        testimonials: testimonials.data ?? [],
      };
    },
  });

  const update = useMutation({
    mutationFn: async ({
      table,
      id,
      values,
    }: {
      table: ContentTable;
      id: string;
      values: { published?: boolean; featured?: boolean };
    }) => {
      const { error } = await supabase.from(table).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Content updated");
      void qc.invalidateQueries({ queryKey: ["admin-content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const d = content.data;

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="eyebrow">Content</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Website content</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Everything the public site shows comes from here. Unpublish an item to hide it instantly.
        </p>
      </div>

      <Panel title="Destinations">
        {d?.destinations.length ? (
          <ul className="divide-y divide-border">
            {d.destinations.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.country} · {item.duration}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Published</Label>
                  <Switch
                    checked={item.published}
                    onCheckedChange={(v) =>
                      update.mutate({ table: "destinations", id: item.id, values: { published: v } })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No destinations." />
        )}
      </Panel>

      <Panel title="Safari packages">
        {d?.packages.length ? (
          <ul className="divide-y divide-border">
            {d.packages.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.days} days · from {money(item.price_from, item.currency)} · {item.category}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Featured</Label>
                    <Switch
                      checked={item.featured}
                      onCheckedChange={(v) =>
                        update.mutate({ table: "packages", id: item.id, values: { featured: v } })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Published</Label>
                    <Switch
                      checked={item.published}
                      onCheckedChange={(v) =>
                        update.mutate({ table: "packages", id: item.id, values: { published: v } })
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No packages." />
        )}
      </Panel>

      <Panel title="Activities">
        {d?.activities.length ? (
          <ul className="divide-y divide-border">
            {d.activities.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <p className="font-medium text-foreground">{item.name}</p>
                <Switch
                  checked={item.published}
                  onCheckedChange={(v) => update.mutate({ table: "activities", id: item.id, values: { published: v } })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No activities." />
        )}
      </Panel>

      <Panel title="Blog posts">
        {d?.posts.length ? (
          <ul className="divide-y divide-border">
            {d.posts.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <Switch
                  checked={item.published}
                  onCheckedChange={(v) => update.mutate({ table: "blog_posts", id: item.id, values: { published: v } })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No posts." />
        )}
      </Panel>

      <Panel title="Testimonials">
        {d?.testimonials.length ? (
          <ul className="divide-y divide-border">
            {d.testimonials.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-foreground">
                    {item.name} · {item.country}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.trip}</p>
                </div>
                <Switch
                  checked={item.published}
                  onCheckedChange={(v) =>
                    update.mutate({ table: "testimonials", id: item.id, values: { published: v } })
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No testimonials." />
        )}
      </Panel>
    </div>
  );
}
