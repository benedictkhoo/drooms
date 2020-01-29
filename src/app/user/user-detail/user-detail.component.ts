import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

export interface UserDetailResponse {
  user: {
    avatarUrl: string;
    bio: string;
    followers: {
      totalCount: number;
    };
    following: {
      totalCount: number;
    };
    name: string;
    isHireable: boolean;
    location: string;
    repositories: {
      nodes: {
        name: string;
      }[];
      totalCount: number;
    };
  };
}

export interface UserDetail {
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  name: string;
  isHireable: boolean;
  location: string;
  repositories: {
    names: string[];
    totalCount: number;
  };
}

@Component({
  selector: 'drooms-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  constructor(@Inject(MAT_DIALOG_DATA) private data: { login: string }, private apollo: Apollo) { }

  private destroy$ = new Subject<boolean>();
  user: UserDetail;

  ngOnInit() {
    this.apollo.query<UserDetailResponse>({
      query: gql`
        query UserDetail($login: String!) {
          user(login: $login) {
            avatarUrl(size: 40)
            bio
            followers(first: 10) {
              totalCount
            }
            following(first: 10) {
              totalCount
            }
            name
            isHireable
            location
            repositories(first: 10, orderBy: {direction: ASC, field: STARGAZERS}, privacy: PUBLIC) {
              nodes {
                name
              }
              totalCount
            }
          }
        }
      `,
      variables: {
        login: this.data.login
      }
    })
    .pipe(
      takeUntil(this.destroy$),
      switchMap((response) => of(response.data.user))
    )
    .subscribe((response) => {
      console.log(response);
      this.user = {
        avatarUrl: response.avatarUrl,
        bio: response.bio,
        followers: response.followers.totalCount || 0,
        following: response.following.totalCount || 0,
        name: response.name || 'N/A',
        isHireable: response.isHireable,
        location: response.location,
        repositories: {
          names: response.repositories.nodes.map(({ name }) => name) || [],
          totalCount: response.repositories.totalCount || 0
        }
      };
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
