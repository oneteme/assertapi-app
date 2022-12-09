import { Component, Input } from "@angular/core";
import { ThemePalette } from "@angular/material/core";

@Component({
    selector: 'icon',
    template: `
        <mat-icon
            [ngClass]="{ 'material-icons-outlined': iconOutlined }"
            style="cursor: default;"
            [color]="colorIcon"
            [ngStyle]="{ 'color' : colorCustom, 'width.px': size, 'height.px': size, 'font-size.px': size }"
        >{{ icon }}</mat-icon>
    `,
})
export class IconComponent {
    @Input() icon: string;
    @Input() iconOutlined = true;
    @Input() size: number;
    @Input() set color(col: ThemePalette | string | null) {
        if (['primary', 'accent', 'warn'].includes(col)) {
            this.colorIcon = col as ThemePalette;
        } else {
            this.colorCustom = col;
        }
    }

    colorIcon: ThemePalette;
    colorCustom: string;
}