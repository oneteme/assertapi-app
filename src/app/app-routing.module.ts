import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { DetailComponent } from "./component/detail/detail.component";
import { EnvironmentComponent } from "./component/environment/environment.component";
import { LaunchComponent } from "./component/launch/launch.component";
import { RequestComponent } from "./component/request/request.component";
import { ResultView } from "./component/result/result.view";
import { TraceComponent } from "./component/trace/trace.component";

export const routes: Routes = [
    { 
        path: 'home', 
        children: [
            { path: 'environment', component: EnvironmentComponent },
            { path: 'request', component: RequestComponent },
            { 
                path: 'launch', 
                children: [
                    { path: '', component: LaunchComponent },
                    { path: ':id', component: ResultView },
                    { path: ':id/detail', component: DetailComponent },
                ]
            },
            { path: 'trace', component: TraceComponent },
            { path: '**', redirectTo: 'environment', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
]
@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }