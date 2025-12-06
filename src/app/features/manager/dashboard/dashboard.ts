import { Component } from '@angular/core';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';

@Component({
  selector: 'app-dashboard',
  imports: [MenuManager],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
