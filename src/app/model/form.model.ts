import { FormControl } from "@angular/forms";
import { LoginTypeEnum } from "./environment.model";

export interface LoginForm {
    type: FormControl<LoginTypeEnum>;
    username?: FormControl<string>;
    password?: FormControl<string>;
}