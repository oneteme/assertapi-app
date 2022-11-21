import { Configuration } from "src/app/model/request.model";

export class LaunchDialog {
    actualApp: string;
    actualEnv: string;
    expectedEnv: string;
    ids: Array<number>;
    disabledIds: Array<number>;
    configuration: Configuration;
}