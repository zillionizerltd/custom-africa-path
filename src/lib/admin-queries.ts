import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/** Packages as pick-list options for staff tools (quote builder, new booking). */
export const packageOptionsQuery = queryOptions({
  queryKey: ["package-options"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("packages")
      .select("id,title,days,price_from,currency,destination_slugs,itinerary")
      .order("sort_order");
    if (error) throw error;
    return data;
  },
});
