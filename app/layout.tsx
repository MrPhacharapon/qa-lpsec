import type { Metadata, Viewport } from 'next';
import { Sarabun } from 'next/font/google';
import './globals.css';

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-sarabun',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'งานประกันคุณภาพการศึกษา | ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง',
  description: 'ระบบสืบค้นและเผยแพร่ข้อมูลสารสนเทศงานประกันคุณภาพการศึกษา ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง',
  keywords: ['งานประกันคุณภาพการศึกษา', 'ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง', 'SAR', 'มาตรฐานการศึกษา'],
  authors: [{ name: 'ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง' }],
  icons: {
    icon: 'https://i.postimg.cc/8kKrvnfY/removebg-preview.png',
    apple: 'https://i.postimg.cc/8kKrvnfY/removebg-preview.png',
  },
  openGraph: {
    title: 'งานประกันคุณภาพการศึกษา ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง',
    description: 'ระบบสืบค้นและเผยแพร่ข้อมูลงานประกันคุณภาพการศึกษา',
    url: 'https://qa-lpsec.vercel.app',
    siteName: 'งานประกันคุณภาพการศึกษา',
    images: [
      {
        url: 'https://i.postimg.cc/8kKrvnfY/removebg-preview.png',
        width: 800,
        height: 800,
        alt: 'ตราสัญลักษณ์ศูนย์การศึกษาพิเศษ ประจำจังหวัดลำปาง',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sarabun.variable} font-sans scroll-smooth`}>
      <head>
        {/* Native DOM Error Catcher (Pure ES5) - ป้องกันหน้าขาวค้างแบบเงียบๆ บนเบราว์เซอร์และมือถือรุ่นเก่า */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onerror = function(msg, url, line, col, error) {
                try {
                  var errDiv = document.getElementById('native-error-banner');
                  if (!errDiv) {
                    errDiv = document.createElement('div');
                    errDiv.id = 'native-error-banner';
                    errDiv.style.position = 'fixed';
                    errDiv.style.top = '0';
                    errDiv.style.left = '0';
                    errDiv.style.width = '100%';
                    errDiv.style.backgroundColor = '#dc2626';
                    errDiv.style.color = '#ffffff';
                    errDiv.style.padding = '16px';
                    errDiv.style.zIndex = '999999';
                    errDiv.style.wordBreak = 'break-all';
                    errDiv.style.fontSize = '14px';
                    errDiv.style.fontFamily = 'sans-serif';
                    errDiv.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
                    document.body.appendChild(errDiv);
                  }
                  errDiv.innerHTML = '<div style="max-width:960px;margin:0 auto;"><b>🚨 [พบข้อผิดพลาดของระบบ]</b><br/>' + 
                    String(msg) + '<br/><small style="opacity:0.85;">' + String(url) + ' (บรรทัด ' + line + ')</small>' +
                    '<button onclick="location.reload()" style="margin-left:12px;padding:4px 8px;background:#fff;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">โหลดใหม่</button></div>';
                } catch(e) {}
                return false;
              };
              window.onunhandledrejection = function(e) {
                try {
                  console.warn('Unhandled promise rejection:', e.reason);
                } catch(err) {}
              };
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
