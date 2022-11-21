import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LaunchDialog } from "./launch-dialog.model";

@Injectable({
    providedIn: 'root'
})
export class LaunchDialogService {
    launchDialog: BehaviorSubject<LaunchDialog> = new BehaviorSubject(new LaunchDialog());
}
