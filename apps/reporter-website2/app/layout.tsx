import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
      </head>
      <body className="overflow-y-scroll bg-slate-200">{children}</body>
    </html>
  );
}
