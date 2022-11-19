import {
  type User,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { type GetServerSidePropsContext } from "next";
import type { ReactElement } from "react";
import BaseLayout from "../components/layouts/BaseLayout";
import { type NextPageWithLayout } from "../types/nextpage.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Page: NextPageWithLayout<{ user: User; data: any }> = ({
  user,
  data,
}) => {
  return (
    <>
      <div>Protected content for {user.email}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  // Run queries with RLS on the server
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  return {
    props: {
      initialSession: session,
      user: session.user,
      data: data ?? [],
    },
  };
};

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <BaseLayout>
      <div>{page}</div>
    </BaseLayout>
  );
};

export default Page;
