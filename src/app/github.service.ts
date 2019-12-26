import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GithubUser } from './github-user';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GithubRepo } from './github-repo';

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
            created: item.created_at,
            updated: item.updated_at
          };
        });
      })
    );
  }
}
