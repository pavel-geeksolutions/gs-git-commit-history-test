import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GithubUser } from './github-user';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GithubRepo } from './github-repo';
import { GithubCommit } from './github-commit';
import { PageableResponse } from './pageable-response';

const BASE_URL = 'https://api.github.com';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private httpClient: HttpClient) {
  }

  getUsers(term: string): Observable<GithubUser[]> {
    return this.httpClient.get<any>(`${BASE_URL}/search/users?q=${term}`).pipe(
      map(responseBody => {
        return responseBody.items.map((item) => {
          const {id, login, avatar_url, gravatar_id, score} = item;
          return {
            id, login, avatarUrl: avatar_url, gravatarId: gravatar_id, score
          };
        });
      })
    );
  }

  getRepos(userLogin: string): Observable<GithubRepo[]> {
    return this.httpClient.get<any>(
      `${BASE_URL}/users/${userLogin}/repos`).pipe(
      map(responseBody => {
        return responseBody.map((item) => {
          const {
            id, name, description, size,
            language
          } = item;
          return {
            id,
            name,
            fullName: item.full_name,
            description,
            defaultBranch: item.default_branch,
            size,
            topics: item.topics || [],
            language,
            created: new Date(item.created_at),
            updated: new Date(item.updated_at)
          };
        });
      })
    );
  }

  getCommits(userLogin: string, repo: string, page: number = 1,
             perPage: number = 10): Observable<PageableResponse<GithubCommit>> {
    return this.httpClient.get<any>(
      `${BASE_URL}/repos/${userLogin}/${repo}/commits?page=${page}&per_page=${perPage}`,
      {observe: 'response'}).pipe(
      map(response => {
        let commits = response.body.map((item) => {
          return {
            sha: item.sha,
            message: item.commit.message,
            authorLogin: item.author.login,
            authorName: item.commit.author.name,
            authorEmail: item.commit.author.email,
            authorDate: new Date(item.commit.author.date),
            url: item.url
          };
        });
        return {
          records: commits,
          page,
          perPage,
          totalRecords: this.parseLinkHeader(response.headers) * perPage
        };
      })
    );
  }

  parseLinkHeader(headers: HttpHeaders): number {
    let linksHeaderValue = headers.get('Link');
    if (!linksHeaderValue) {
      return 1;
    }

    const parts: string[] = linksHeaderValue.split(',');
    return +parts.find(link => link.includes('last')).
      match(/[^_]page=(\d+)/)[1];
  }
}
