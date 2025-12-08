import { Component } from '@angular/core';
import { IndexNavbar } from '../components/menu-bar/index-navbar/index-navbar';
@Component({
  selector: 'app-index',
  imports: [IndexNavbar],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {}
