import { DataSource } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject, EMPTY, merge, Observable, of } from 'rxjs';
import { debounceTime, expand, map, reduce, skip, switchMap, tap } from 'rxjs/operators';

export interface UserListResponse {
  search: {
    edges: {
      node: UserListItem;
    }[];
    pageInfo: {
      endCursor: string;
    };
  };
}

export interface UserListItem {
  avatarUrl: string;
  name: string;
  email: string;
  login: string;
  url: string;
}

export class UserListDataSource extends DataSource<UserListItem> {
  loading$ = new BehaviorSubject<boolean>(true);
  private data: UserListItem[] = [];
  private searchQuery = '';

  constructor(private apollo: Apollo, private paginator: MatPaginator, private sort: MatSort, private search: FormControl) {
    super();
  }

  connect(): Observable<UserListItem[]> {
    const dataMutations = [
      this.query()
        .pipe(
          expand((response, index) => {
            return index <= 8 ? this.query(response.search.pageInfo.endCursor) : EMPTY;
          }),
          reduce((acc: UserListItem[], data: UserListResponse) => {
            return acc.concat(data.search.edges.map(({ node }) => node));
          }, []),
          tap((users) => {
            this.loading$.next(false);
            this.data = users;
            this.paginator.length = users.length;
          })
        ),
      this.paginator.page,
      this.sort.sortChange,
      this.search.valueChanges
      .pipe(
        skip(1),
        debounceTime(500),
        tap((query) => this.searchQuery = query)
      )
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData(this.getFilteredData([...this.data])));
    }));
  }

  disconnect() { }

  private query(after?: string): Observable<UserListResponse> {
    return this.apollo.query<UserListResponse>({
      query: gql`
        query UserList($after: String) {
          search(after: $after, first: 100, query: "repos:>=0", type: USER) {
            edges {
              node {
                ... on User {
                  avatarUrl(size: 50)
                  name
                  email
                  id
                  login
                  url
                }
              }
            }
            pageInfo {
              endCursor
            }
          }
        }
      `,
      variables: {
        after
      }
    })
      .pipe(
        switchMap((response) => of(response.data))
      );
  }

  private getPagedData(data: UserListItem[]) {
    this.paginator.length = data.length;

    if (data.length === 0) {
      return data;
    }

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  private getSortedData(data: UserListItem[]) {
    if (data.length === 0) {
      return data;
    }

    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';

      switch (this.sort.active) {
        case 'email': return compare(a.email, b.email, isAsc); break;
        case 'name': return compare(a.name, b.name, isAsc); break;
        default: return 0;
      }
    });
  }

  private getFilteredData(data: UserListItem[]) {
    if (!this.searchQuery) {
      return data;
    }

    const searchQuery = new RegExp(
      this.searchQuery.split(/\s/).map((_query, _index, queries) => '(?:' + queries.join('|') + ')').join('.*'),
      'gi'
    );
    this.searchQuery = '';

    return data.filter(({ name, email }) => {
      if (!name && !email) {
        return false;
      }

      return (name ? name.match(searchQuery) : false) || (email ? email.split('@')[0].match(searchQuery) : false);
    });
  }
}

function compare(a: string, b: string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
