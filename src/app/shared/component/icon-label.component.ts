import { Component, Input } from "@angular/core";
import { ThemePalette } from "@angular/material/core";

@Component({
    selector: 'icon-label',
    template: `
        <div style="display: flex; align-items: center;">
            <span *ngIf="iconPosition == 'right'">{{label}}</span>
            <mat-icon
                [ngClass]="{ 'material-icons-outlined': iconOutlined }"
                style="cursor: default;"
                [color]="colorIcon"
                [ngStyle]="{ 'margin-right.em': iconPosition == 'left' ? '0.5' : '0', 'margin-left.em': iconPosition == 'right' ? '0.5' : '0', 'color' : colorCustom, 'width.px': size, 'height.px': size, 'font-size.px': size }">
                {{ icon }}
            </mat-icon>
            <span *ngIf="iconPosition == 'left'">{{label}}</span>
        </div>
    `,
})
export class IconLabelComponent {
    @Input() icon: string;
    @Input() iconOutlined = true;
    @Input() iconPosition: 'left' | 'right' = 'left';
    @Input() label: string;
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