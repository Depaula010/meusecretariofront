import { Component, OnInit, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Calendar,
} from 'lucide-angular';
import { Chart, registerables } from 'chart.js';

// Registrar componentes do Chart.js
Chart.register(...registerables);

interface KPICard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'danger';
  date: Date;
}

/**
 * Dashboard Component
 *
 * Tela principal do sistema com:
 * - KPIs financeiros (Saldo, Receitas, Despesas)
 * - Gráfico de evolução do saldo
 * - Lista de alertas e contas a vencer
 *
 * Usa Signals para gerenciamento de estado
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('balanceChart') balanceChartRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  // Ícones
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  DollarSignIcon = DollarSign;
  AlertCircleIcon = AlertCircle;
  CalendarIcon = Calendar;

  // ==========================================
  // Signals de Estado
  // ==========================================

  /**
   * Loading state
   */
  loading = signal(true);

  /**
   * Dados de KPIs
   */
  kpis = signal<KPICard[]>([
    {
      title: 'Saldo Atual',
      value: 'R$ 12.450,00',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Receitas do Mês',
      value: 'R$ 8.500,00',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Despesas do Mês',
      value: 'R$ 6.200,00',
      change: '-3.1%',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-red-600'
    }
  ]);

  /**
   * Alertas financeiros
   */
  alerts = signal<Alert[]>([
    {
      id: '1',
      title: 'Conta de Luz vence amanhã',
      description: 'Valor: R$ 245,00',
      type: 'warning',
      date: new Date('2024-12-12')
    },
    {
      id: '2',
      title: 'Vencimento do cartão em 3 dias',
      description: 'Fatura de R$ 1.850,00',
      type: 'info',
      date: new Date('2024-12-14')
    },
    {
      id: '3',
      title: 'Aluguel vence em 5 dias',
      description: 'Valor: R$ 1.200,00',
      type: 'warning',
      date: new Date('2024-12-16')
    }
  ]);

  /**
   * Dados para o gráfico de evolução
   */
  balanceData = signal({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    values: [10000, 10500, 11200, 10800, 11500, 12450]
  });

  // ==========================================
  // Computed Signals
  // ==========================================

  /**
   * Número total de alertas
   */
  totalAlerts = computed(() => this.alerts().length);

  /**
   * Alertas urgentes (até 2 dias)
   */
  urgentAlerts = computed(() => {
    const today = new Date();
    return this.alerts().filter(alert => {
      const diff = Math.floor((alert.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 2;
    });
  });

  // ==========================================
  // Lifecycle Hooks
  // ==========================================

  ngOnInit(): void {
    // Simular carregamento de dados
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Inicializar gráfico após view estar pronta
    this.initChart();
  }

  // ==========================================
  // Métodos
  // ==========================================

  /**
   * Carregar dados do dashboard
   */
  loadDashboardData(): void {
    // TODO: Substituir por chamada real à API
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }

  /**
   * Inicializar gráfico de evolução do saldo
   */
  initChart(): void {
    if (!this.balanceChartRef) return;

    const ctx = this.balanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.balanceData();

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Saldo',
          data: data.values,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `Saldo: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => {
                return `R$ ${Number(value).toLocaleString('pt-BR')}`;
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  /**
   * Obter classe de cor para badge de alerta
   */
  getAlertBadgeClass(type: Alert['type']): string {
    const classes = {
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      danger: 'bg-red-100 text-red-800 border-red-200'
    };
    return classes[type] || classes.info;
  }

  /**
   * Formatar data relativa (ex: "Amanhã", "Em 3 dias")
   */
  formatRelativeDate(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diff = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff > 0) return `Em ${diff} dias`;
    if (diff === -1) return 'Ontem';
    return `Há ${Math.abs(diff)} dias`;
  }

  /**
   * Cleanup ao destruir componente
   */
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
