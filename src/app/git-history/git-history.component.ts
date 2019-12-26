import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { concat, Observable, of, Subject } from 'rxjs';
import { GithubRepo, GithubUser } from '../interfaces';
import { GithubService } from '../services/github.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';

const USER_INPUT_DEBOUNCE = 300; // ms

@Component({
  selector: 'app-git-history',
  templateUrl: './git-history.component.html',
  styleUrls: ['./git-history.component.scss']
})
export class GitHistoryComponent implements OnInit, OnDestroy {
  users$: Observable<GithubUser[]>;
  user: GithubUser;
  repos$: Observable<GithubRepo[]>;
  repo: GithubRepo;
  usersLoading = false;
  reposLoading = false;
  usersInput$ = new Subject<string>();
  userSelected$ = new EventEmitter<string>();

  constructor(private gitService: GithubService) {
  }

  ngOnInit() {

    this.users$ = concat(
      of([]), // default items
      this.usersInput$.pipe(
        debounceTime(USER_INPUT_DEBOUNCE),
        distinctUntilChanged(),
        tap(() => this.usersLoading = true),
        switchMap(term => this.gitService.getUsers(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.usersLoading = false)
        ))
      )
    );
    this.repos$ = concat(
      of([]), // default items
      this.userSelected$.pipe(
        distinctUntilChanged(),
        tap(() => this.reposLoading = true),
        switchMap(userLogin => this.gitService.getRepos(userLogin).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => {
            this.reposLoading = false;
            this.repo = null;
          })
        ))
      )
    );
  }

  onUserSelected(user: GithubUser) {
    this.userSelected$.emit(user ? user.login : '');
  }

  ngOnDestroy(): void {
  }

}
