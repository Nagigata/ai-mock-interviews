import Link from "next/link";
import { CompassIcon } from "lucide-react";
import PageState from "@/components/shared/PageState";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageState
      icon={<CompassIcon className="size-6" />}
      title="Page not found"
      description="We couldn't find what you were looking for."
      action={
        <Button asChild>
          <Link href="/preparation">Go to preparation</Link>
        </Button>
      }
    />
  );
}
