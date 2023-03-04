import Header from "../../../../app/header";

export default function Layout({ children, params: { id } }: { children: React.ReactNode; params: { id: string } }) {
  return (
    <>
      <Header id={id} />
      <main className="container max-w-7xl mx-auto sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
