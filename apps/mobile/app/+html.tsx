import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

/**
 * Web shell for static export (Netlify, etc.). Ensures html/body fill the viewport
 * so tab scenes render below the header instead of collapsing to zero height.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>SND Field</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; }
              body { margin: 0; overflow-x: hidden; }
              #root { display: flex; flex-direction: column; flex: 1; min-height: 100%; }
            `,
          }}
        />
      </head>
      <body style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
