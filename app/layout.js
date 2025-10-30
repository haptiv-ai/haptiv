export const metadata = { title: "Haptiv.ai", description: "Agentic AI for healthcare service design" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-[var(--offwhite)]">{children}</body>
    </html>
  );
}
