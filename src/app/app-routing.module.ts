import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { EnvironmentComponent } from "./component/environment/environment.component";
import { RequestComponent } from "./component/request/request.component";
import { ResultComponent } from "./component/result/result.component";
import { TraceComponent } from "./component/trace/trace.component";

export const routes: Routes = [
    { 
        path: 'home', 
        children: [
            { path: 'environment', component: EnvironmentComponent },
            { path: 'request', component: RequestComponent },
            { path: 'launch', component: ResultComponent },
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