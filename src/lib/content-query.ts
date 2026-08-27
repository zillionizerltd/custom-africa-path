import { queryOptions } from "@tanstack/react-query";

import { getSiteContent } from "@/lib/content.functions";

export const siteContentQueryOptions = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
});
