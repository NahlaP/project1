

// import { Html, Head, Main, NextScript } from 'next/document';

// export default function Document() {
//   return (
//     <Html lang="en">
//       <Head>
//         {/* ✅ Load Inter font (all weights) */}
//         <link
//           href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
//           rel="stylesheet"
//         />

//         {/* ✅ Feather Icons CDN fallback */}
//         <link
//           href="https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/dist/feather.css"
//           rel="stylesheet"
//         />

//         {/* Optional: Font Awesome if needed */}
//         <link
//           href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
//           rel="stylesheet"
//         />
//       </Head>
//       <body>
//         <Main />
//         <NextScript />
//       </body>
//     </Html>
//   );
// }


// C:\Users\97158\Desktop\project1\dashboard\pages\_document.js
import { Html, Head, Main, NextScript } from 'next/document';
import { s3Bucket, s3Region } from '../lib/config'; // <-- add this

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* 👇 This makes "sections/..." resolve to S3 during initial parse (SSR) */}
        <base href={`https://${s3Bucket}.s3.${s3Region}.amazonaws.com/`} />

        {/* Fonts / icons you already had */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/dist/feather.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
