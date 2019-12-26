export interface GithubCommit {
  sha: string;
  message: string;
  authorLogin: string;
  authorName: string;
  authorEmail: string;
  authorDate: Date;
  url: string;
}
