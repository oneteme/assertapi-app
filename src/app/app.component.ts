import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from './service/environment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private environmentService: EnvironmentService) { }

  ngOnInit(): void {
    this.environmentService.getEnvironments().subscribe();
  }
}
