import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
@Component({
  selector: 'app-index-navbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './index-navbar.html',
  styleUrl: './index-navbar.scss',
})
export class IndexNavbar {}
