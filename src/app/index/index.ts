import { Component } from '@angular/core';
import { IndexNavbar } from './index-navbar/index-navbar';
@Component({
  selector: 'app-index',
  imports: [IndexNavbar],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {}
