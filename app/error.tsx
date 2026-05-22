"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import PageState from "@/components/shared/PageState";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageState
      tone="danger"
      icon={<TriangleAlertIcon className="size-6" />}
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or head back to your preparation."
      action={
        <>
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/preparation">Go to preparation</Link>
          </Button>
        </>
      }
    />
  );
}
