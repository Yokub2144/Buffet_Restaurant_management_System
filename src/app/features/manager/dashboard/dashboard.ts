import { Component, OnInit } from '@angular/core';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-dashboard',
  imports: [MenuManager, ChartModule, ButtonModule, CardModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  data: any;
  options: any;
  timeNow: string = '';
  private timer: any;

  ngOnInit() {
    this.updateTime();
    this.initChart();
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  currentDate: string = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  updateTime() {
    this.timeNow = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  // ข้อมูลจำลองสำหรับ Cards ด้านบน
  kpiData = [
    {
      title: '฿50,000',
      subtitle: 'ยอดขายวันนี้',
      icon: 'pi pi-chart-line',
      color: 'bg-blue-900',
      textColor: 'text-blue-500',
    }, // ปรับสี custom ใน css ได้
    {
      title: '294',
      subtitle: 'ลูกค้าทั้งหมด',
      icon: 'pi pi-users',
      color: 'bg-purple-900',
      textColor: 'text-purple-500',
    },
    {
      title: '12:00-13:00',
      subtitle: 'ช่วงเวลาที่คึกคักที่สุด',
      icon: 'pi pi-clock',
      color: 'bg-teal-900',
      textColor: 'text-teal-500',
    },
    {
      title: '43',
      subtitle: 'ลูกค้าในช่วงนี้',
      icon: 'pi pi-calendar',
      color: 'bg-green-900',
      textColor: 'text-green-500',
    },
  ];

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = '#ffffff';
    const textColorSecondary = '#a1a1aa';
    const surfaceBorder = '#27272a'; // สีเส้น grid แบบจางๆ

    this.data = {
      labels: [
        '23/09/2568',
        '24/09/2568',
        '25/09/2568',
        '26/09/2568',
        '27/09/2568',
        '28/09/2568',
        '29/09/2568',
      ],
      datasets: [
        {
          label: 'ยอดขายรายวัน',
          data: [50000, 24000, 48000, 38000, 50000, 65000, 50000],
          backgroundColor: '#22c55e', // สีเขียวตามรูป
          borderColor: '#22c55e',
          borderWidth: 1,
          barThickness: 50, // ความกว้างแท่งกราฟ
        },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          display: false, // ซ่อน legend ของ chart.js เพื่อทำ custom เองตามรูป
        },
        tooltip: {
          backgroundColor: '#27272a',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#22c55e',
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            label: function (context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('th-TH', {
                  style: 'currency',
                  currency: 'THB',
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
          border: {
            display: false,
          },
        },
      },
    };
  }
}
