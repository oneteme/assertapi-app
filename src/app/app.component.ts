import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { EnvironmentService } from './service/environment.service';
import { RequestService } from './service/request.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isLarge$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(private environmentService: EnvironmentService, private requestService: RequestService, private breakpointObserver: BreakpointObserver) { 
    environmentService.getEnvironments().subscribe();
    requestService.getRequests().subscribe();
  }

  ngOnInit(): void {
    
  }
}
