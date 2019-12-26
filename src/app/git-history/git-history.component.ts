import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { concat, Observable, of, Subject, merge } from 'rxjs';
import { GithubCommit, GithubRepo, GithubUser } from '../interfaces';
import { GithubService } from '../services/github.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  map
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
  commits$: Observable<GithubCommit[]>;
  usersLoading = false;
  reposLoading = false;
  commitsLoading = false;
  usersInput$ = new Subject<string>();
  userSelected$ = new EventEmitter<string>();
  repoSelected$ = new EventEmitter<[string, string]>();
  // pagination
  page = 1;
  pageSize = 10;
  total = 0;
  pageChanged$ = new EventEmitter<number>();

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
    this.commits$ = merge(
      this.repoSelected$,
      this.pageChanged$
    ).pipe(
      distinctUntilChanged(),
      tap(() => this.commitsLoading = true),
      switchMap(() => this.gitService.getCommits(this.user.login, this.repo.name, this.page, this.pageSize).pipe(
        map(commitsResponse => {
          this.total = commitsResponse.totalRecords;
          return commitsResponse.records;
        }),
        catchError(() => of([])), // empty list on error
        tap(() => this.commitsLoading = false)
      ))
    );
  }

  onUserSelected(user: GithubUser) {
    this.userSelected$.emit(user && user.login);
  }

  onRepoSelected(repo: GithubRepo) {
    this.repoSelected$.emit([this.user.login, repo && repo.name]);
  }

  onPageChange(page: number) {
    this.pageChanged$.emit(page);
  }

  ngOnDestroy(): void {
  }

}
