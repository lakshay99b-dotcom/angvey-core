import './globals.css';

export const metadata = {
  title: 'ANGVEY Finisher',
  description: 'Persistent task agent for solopreneurs — finish what you start',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
