import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GithubUser } from '../interfaces';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GithubRepo } from '../interfaces';
import { GithubCommit } from '../interfaces';
import { PageableResponse } from '../interfaces';

const BASE_URL = 'https://api.github.com';
const LINK_HEADER_NAME = 'Link';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private httpClient: HttpClient) {
  }

  private static parseTotalPagesFromLinkHeader(headers: HttpHeaders): number {
    const linksHeaderValue = headers.get(LINK_HEADER_NAME);
    if (!linksHeaderValue) {
      return 1;
    }

    const parts: string[] = linksHeaderValue.split(',');
    const lastItemLink = parts.find(link => link.includes('last'));
    if (!lastItemLink) {
      // already last page
      return 0;
    }
    return +lastItemLink.match(/[^_]page=(\d+)/)[1];
  }

  getUsers(term: string): Observable<GithubUser[]> {
    if (!term) {
      return of([]);
    }
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
    if (!userLogin) {
      return of([]);
    }
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

  getCommits(userLogin: string, repoName: string, branch: string = 'master', page: number = 1,
             perPage: number = 10): Observable<PageableResponse<GithubCommit>> {
    return this.httpClient.get<any>(
      `${BASE_URL}/repos/${userLogin}/${repoName}/commits?page=${page}&per_page=${perPage}&sha=${branch}`,
      {observe: 'response'}).pipe(
      map(response => {
        const commits = response.body.map((item) => {
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
        const totalPagesCount = GithubService.parseTotalPagesFromLinkHeader(response.headers) || page;
        return {
          records: commits,
          page,
          perPage,
          totalRecords: totalPagesCount * perPage
        };
      })
    );
  }

  getRepoBranches(userLogin: string, repoName: string): Observable<string[]> {
    return this.httpClient.get<{ name: string }[]>(
      `${BASE_URL}/repos/${userLogin}/${repoName}/branches`).pipe(
      map(responseBody => {
        return responseBody.map((item) => item.name);
      })
    );
  }
}
