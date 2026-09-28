import { AppPayload, Category, CategoryData, DocumentLink, YearGroupLinks } from './types';

export const SPREADSHEET_ID = '13kyNE4mOwtoDs4-7QY-bq9058GJNb_xHQiJiPHCxb6E';

/**
 * Robust CSV parser that handles quotes, escaped quotes (""), commas, and newlines (\r\n / \n)
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(current.trim());
      // Only push non-empty rows
      if (row.some(cell => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some(cell => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Sanitizes URLs, fixes Google Drive image links, trims whitespaces,
 * and escapes problematic characters to prevent silent UI breakage.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#' || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') {
    return '';
  }

  // If user pasted a Google Drive share link into an image column, convert to direct viewable URL
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com'))) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }

  return trimmed;
}

export function sanitizeImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#' || trimmed.toLowerCase() === 'undefined') {
    return '';
  }

  // Convert Google Drive view link to direct thumbnail/image if used as picture
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  // Encode Thai/Unicode characters in URL if not already encoded
  try {
    return encodeURI(decodeURI(trimmed));
  } catch {
    return trimmed;
  }
}

const DEFAULT_THEMES: Record<string, string> = {
  table: 'blue',
  desc: 'emerald',
  standard: 'purple',
  manual: 'orange',
  report: 'rose',
  sar: 'indigo',
  history: 'teal',
};

const DEFAULT_IDS = ['table', 'desc', 'standard', 'manual', 'report', 'sar', 'history'];

/**
 * Extracts GID parameter from Google Sheets URL
 */
function extractGid(url: string): string {
  const match = url.match(/[#?&]gid=([0-9]+)/);
  return match ? match[1] : '';
}

/**
 * Main fetch function: Fetches and parses all Google Sheets tabs with full error resilience
 */
export async function getFullAppData(): Promise<AppPayload> {
  const debugLogs: string[] = [];

  try {
    // 1. Fetch 'main' tab to retrieve navigation categories and status
    const mainUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=main`;
    const mainRes = await fetch(mainUrl, { next: { revalidate: 60 } });
    if (!mainRes.ok) {
      throw new Error(`ไม่สามารถเชื่อมต่อแท็บ 'main' (HTTP Status: ${mainRes.status})`);
    }

    const mainText = await mainRes.text();
    const mainRows = parseCSV(mainText);

    if (mainRows.length <= 1) {
      throw new Error("แท็บ 'main' ไม่มีข้อมูลหรือโครงสร้างไม่ถูกต้อง");
    }

    const categories: Category[] = [];
    const tabData: Record<string, CategoryData> = {};
    const yearSet = new Set<string>();
    let totalDocsCount = 0;

    // 2. Parse categories from rows (row 0 is header)
    for (let i = 1; i < mainRows.length; i++) {
      const row = mainRows[i];
      const tabName = row[0] || '';
      const sheetUrl = row[1] || '';
      const idCol = row[2] || '';
      const title = row[3] || tabName;
      const status = row[4] ? row[4].trim() : '';

      // Skip closed or blank categories
      if (!title || status === 'ปิด') {
        continue;
      }

      // Determine ID
      let id = '';
      const idMatch = idCol.match(/id:\s*['"]([^'"]+)['"]/);
      if (idMatch) {
        id = idMatch[1];
      } else if (i - 1 < DEFAULT_IDS.length) {
        id = DEFAULT_IDS[i - 1];
      } else {
        id = `cat_${i}`;
      }

      const gid = extractGid(sheetUrl);
      const theme = DEFAULT_THEMES[id] || 'blue';

      categories.push({
        id,
        title,
        tabName,
        gid,
        status: status || 'เปิด',
        theme,
      });
    }

    debugLogs.push(`พบหมวดหมู่ที่เปิดใช้งาน: ${categories.length} หมวด`);

    // 3. Fetch all active tabs concurrently
    await Promise.all(
      categories.map(async cat => {
        try {
          const fetchUrl = cat.gid
            ? `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${cat.gid}`
            : `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(cat.tabName)}`;

          const res = await fetch(fetchUrl, { next: { revalidate: 60 } });
          if (!res.ok) {
            tabData[cat.id] = {
              type: 'error',
              location: cat.title,
              message: `โหลดข้อมูลแท็บไม่สำเร็จ (HTTP Status: ${res.status})`,
            };
            return;
          }

          const csvText = await res.text();
          const rows = parseCSV(csvText);

          if (rows.length <= 1) {
            tabData[cat.id] = {
              type: 'empty',
              content: 'ยังไม่มีข้อมูลในหมวดหมู่นี้',
              theme: cat.theme,
            };
            return;
          }

          const header = rows[0];

          // Determine whether this tab is multi_link_list or link_list
          // multi_link_list tabs: 'table', 'desc', 'history'
          if (cat.id === 'table' || cat.id === 'desc' || cat.id === 'history') {
            const items: YearGroupLinks[] = [];
            const h1 = header[1] || 'มาตรฐานที่ 1';
            const h2 = header[2] || 'มาตรฐานที่ 2';
            const h3 = header[3] || 'มาตรฐานที่ 3';

            for (let r = 1; r < rows.length; r++) {
              const row = rows[r];
              const year = row[0]?.trim();
              if (!year) continue;

              yearSet.add(year);
              const l1 = sanitizeUrl(row[1]);
              const l2 = sanitizeUrl(row[2]);
              const l3 = sanitizeUrl(row[3]);

              if (l1) totalDocsCount++;
              if (l2) totalDocsCount++;
              if (l3) totalDocsCount++;

              items.push({
                year,
                links: [
                  { label: h1, url: l1 },
                  { label: h2, url: l2 },
                  { label: h3, url: l3 },
                ],
              });
            }

            // Sort years descending
            items.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));

            tabData[cat.id] = {
              type: 'multi_link_list',
              content: cat.title,
              theme: cat.theme,
              items,
            };
          } else {
            // Single document cards with cover images (link_list)
            const links: DocumentLink[] = [];

            for (let r = 1; r < rows.length; r++) {
              const row = rows[r];
              const year = row[0]?.trim();
              const docTitle = row[1]?.trim();
              const docUrl = sanitizeUrl(row[2]);
              const docPic = sanitizeImageUrl(row[3]);

              // If row has no title or year, skip
              if (!year && !docTitle) continue;
              if (year) yearSet.add(year);
              if (docUrl) totalDocsCount++;

              links.push({
                id: `${cat.id}_${r}`,
                year: year || '',
                title: docTitle || `เอกสารปี ${year}`,
                url: docUrl,
                imageUrl: docPic,
              });
            }

            // Sort by year descending if available
            links.sort((a, b) => {
              const yA = parseInt(a.year || '0') || 0;
              const yB = parseInt(b.year || '0') || 0;
              return yB - yA;
            });

            tabData[cat.id] = {
              type: 'link_list',
              content: cat.title,
              academicYear: 'ข้อมูลรายปี',
              theme: cat.theme,
              links,
            };
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          tabData[cat.id] = {
            type: 'error',
            location: cat.title,
            message: errMsg,
          };
          debugLogs.push(`เกิดข้อผิดพลาดใน ${cat.title}: ${errMsg}`);
        }
      })
    );

    const availableYears = Array.from(yearSet).sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));

    return {
      status: 'success',
      timestamp: Date.now(),
      categories,
      tabData,
      availableYears,
      totalDocuments: totalDocsCount,
      debugLogs,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      status: 'error',
      timestamp: Date.now(),
      categories: [],
      tabData: {},
      availableYears: [],
      totalDocuments: 0,
      message: errorMsg,
      debugLogs: [errorMsg],
    };
  }
}
