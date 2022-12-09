import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import exporting from 'highcharts/modules/exporting';
import * as Highcharts from 'highcharts/highcharts';

declare var require: any;

require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);
require('highcharts/modules/accessibility')(Highcharts);

@Component({
  selector: 'chart',
  styleUrls: ['./chart.component.scss'],
  template: `<div id='chart-container'></div>`,
})
export class ChartComponent implements OnInit {
  @Output() onClick: EventEmitter<Highcharts.Point> = new EventEmitter();

  private chart: Highcharts.Chart;

  constructor() {
    exporting(Highcharts);
  }

  ngOnInit(): void {
    this.chart = Highcharts.chart('chart-container', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 200
      },
      title: null,
      tooltip: {
        enabled: false, 
        pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        series: {
          events: {
            click: this.emitOnClick.bind(this)
          }
        },
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>'
          }
        }
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      }, 
      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical'
      },
      series: [{
        type: 'pie',
        data: []
      }]
    });
  }

  emitOnClick($event: Highcharts.SeriesClickEventObject) {
    setTimeout(() => {
      console.log("chart", $event.point.selected);
      this.onClick.emit($event.point);
    })
    
  }

  update(points: Array<{id: string, name: string, y: number, color: string}>) {
    this.chart.series[0].setData(points.filter(p => p.y > 0), true);
  }

  showLoading(show: boolean) {
    if(show) this.chart.showLoading();
    else this.chart.hideLoading();
  }
}
