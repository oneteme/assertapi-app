import { Component, OnInit } from '@angular/core';
import exporting from 'highcharts/modules/exporting';
import * as Highcharts from 'highcharts/highcharts';

declare var require: any;

require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);
require('highcharts/modules/accessibility')(Highcharts);

@Component({
  selector: 'app-chart',
  styleUrls: ['./chart.component.scss'],
  template: `<div id='chart-container'></div>`,
})
export class ChartComponent implements OnInit {
  private chart: Highcharts.Chart;

  constructor() { 
    exporting(Highcharts);
  }

  ngOnInit(): void {
    this.chart = Highcharts.chart('chart-container', {
      chart: {
        type: 'solidgauge',
        height: '125px'
      },
      title: null,
      pane: {
        center: ['50%', '85%'],
        size: '140%',
        startAngle: -90,
        endAngle: 90,
        background: [{
          backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
        }]
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        enabled: false
      },
      yAxis: {
        lineWidth: 0,
        tickWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        labels: {
          y: 16
        },
        min: 0,
        max: 100
      },

      plotOptions: {
        solidgauge: {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true
          }
        }
      },

      credits: {
        enabled: false
      },

      series: [{
        type: 'solidgauge',
        data: [0],
        dataLabels: {
            format:
                '<div style="text-align:center">' +
                '<span style="font-size:20px">{y}</span><br/>' +
                '<span style="font-size:12px;opacity:0.4">%</span>' +
                '</div>'
        },
        tooltip: {
            valueSuffix: ' %'
        }
      }]
    });
  }

  update(val: number, redraw: boolean) {
    this.chart.series[0].points[0].update(val, redraw);
  }
}
