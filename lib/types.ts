export interface Category {
  id: string;
  title: string;
  tabName: string;
  gid: string;
  status: string;
  theme: string;
}

export interface DocumentLink {
  id: string | number;
  year?: string;
  title: string;
  url: string;
  imageUrl?: string;
}

export interface YearGroupLinks {
  year: string;
  links: {
    label: string;
    url: string;
  }[];
}

export type CategoryData =
  | {
      type: 'link_list';
      content: string;
      academicYear?: string;
      theme: string;
      links: DocumentLink[];
    }
  | {
      type: 'multi_link_list';
      content?: string;
      theme: string;
      items: YearGroupLinks[];
    }
  | {
      type: 'empty';
      content: string;
      theme: string;
    }
  | {
      type: 'error';
      location: string;
      message: string;
    };

export interface AppPayload {
  status: 'success' | 'error';
  timestamp: number;
  categories: Category[];
  tabData: Record<string, CategoryData>;
  availableYears: string[];
  totalDocuments: number;
  message?: string;
  debugLogs?: string[];
}
