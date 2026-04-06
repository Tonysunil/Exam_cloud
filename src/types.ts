export interface Paper {
  id: string;
  subject: string;
  year: string;
  type: string;
  branch: string;
  semester: string;
  url: string;
  fileName?: string;
  tags?: string[];
  createdAt: string;
}
