import { type AppType } from "next/app";
import { useState } from "react";
import {
  SessionContextProvider,
  type Session,
} from "@supabase/auth-helpers-react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "../types/database.types";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";

const MyApp: AppType<{ initialSession: Session | null }> = ({
  Component,
  pageProps: { initialSession, ...pageProps },
}) => {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  );
};

export default trpc.withTRPC(MyApp);
