import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ThemePalette } from "@angular/material/core";

@Component({
    selector: 'icon-button',
    template: `
        <button mat-icon-button
            [matTooltip]="tooltip"
            [matTooltipPosition]="tooltipPosition"
            matTooltipShowDelay="200"
            [color]="colorIcon"
            [ngStyle]="{ color : colorCustom }"
            (click)="onClick()">
            <mat-icon
                [ngClass]="{ 'material-icons-outlined': iconOutlined }"
                [ngStyle]="{ 'font-size.px': fontSize }">
                {{ icon }}
            </mat-icon>
        </button>
    `,
})
export class IconButtonComponent {
    @Input() icon: string;
    @Input() iconOutlined = true;
    @Input() fontSize: number;
    @Input() tooltip: string;
    @Input() tooltipPosition: 'left' | 'right' | 'above' | 'below' | 'before' | 'after';
    @Input() set color(col: ThemePalette | string | null) {
        if (['primary', 'accent', 'warn'].includes(col)) {
            this.colorIcon = col as ThemePalette;
        } else {
            this.colorCustom = col;
        }
    }
    @Output() clickButton = new EventEmitter(true);

    onClick(): void {
        this.clickButton.emit();
    }

    colorIcon: ThemePalette;
    colorCustom: string;
}