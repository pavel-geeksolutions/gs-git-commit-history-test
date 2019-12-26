export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  size: number;
  topics: string[];
  language: string;
  created: Date;
  updated: Date;
}
