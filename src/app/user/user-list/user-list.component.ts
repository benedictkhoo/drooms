import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { Apollo } from 'apollo-angular';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserListDataSource } from './user-list-datasource';

@Component({
  selector: 'drooms-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: UserListDataSource;

  displayedColumns = ['avatarUrl', 'name', 'email'];
  search = new FormControl('');

  constructor(private dialog: MatDialog, private apollo: Apollo) { }

  ngOnInit() {
    this.dataSource = new UserListDataSource(this.apollo, this.paginator, this.sort, this.search);
  }

  userDetail(login: string): void {
    this.dialog.open(UserDetailComponent, { data: { login }, width: '50%' });
  }
}
