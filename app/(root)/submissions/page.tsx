import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<Record<string, string | string[]>>;
}

const SubmissionsRedirectPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (value) {
      params.append(key, value);
    }
  });

  redirect(`/practice-history${params.size ? `?${params.toString()}` : ""}`);
};

export default SubmissionsRedirectPage;
