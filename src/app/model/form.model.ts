import { FormControl, FormGroup } from "@angular/forms";
import { LoginTypeEnum } from "./environment.model";

export interface LaunchForm {
    app: FormControl<string>;
    env: FormControl<string>;
    loginForm: FormGroup<LoginForm>;
}

export interface LoginForm {
    type: FormControl<LoginTypeEnum>;
    username?: FormControl<string>;
    password?: FormControl<string>;
}

