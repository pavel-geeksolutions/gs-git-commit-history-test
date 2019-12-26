import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GithubUser } from './github-user';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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
}
