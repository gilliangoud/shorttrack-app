import { type AppType } from "next/app";
import type { AppProps } from 'next/app'
import { useState } from "react";
import {
  SessionContextProvider,
  type Session,
} from "@supabase/auth-helpers-react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "../types/database.types";
import { type NextPageWithLayout } from "../types/nextpage.types";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const MyApp: AppType<{ initialSession: Session | null }> = ({
  Component,
  pageProps: { initialSession, ...pageProps },
}: AppPropsWithLayout) => {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      {getLayout(<Component {...pageProps} />)}
    </SessionContextProvider>
  );
};

export default trpc.withTRPC(MyApp);
