import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="container-shell space-y-6 py-20"><Skeleton className="h-12 w-2/3" /><Skeleton className="h-6 w-1/2" /><div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-80" /><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div>; }
