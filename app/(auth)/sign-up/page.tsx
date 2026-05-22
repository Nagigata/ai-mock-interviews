import AuthForm from '@/components/AuthForm';
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import React from 'react';

export const metadata = { title: "Create account" };

const page = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);

  return (
    <div className="flex justify-center items-center h-full"><AuthForm type="sign-up" dictionary={t} /></div>
  )
}

export default page