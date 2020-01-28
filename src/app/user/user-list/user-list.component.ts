import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { Apollo } from 'apollo-angular';
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

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.dataSource = new UserListDataSource(this.apollo, this.paginator, this.sort);
  }
}
