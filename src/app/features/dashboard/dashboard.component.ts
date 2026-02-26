import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Plus,
  BarChart3,
  CreditCard,
} from 'lucide-angular';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from './services/dashboard.service';
import { DashboardSummary, DashboardCharts, RecentTransaction, UpcomingAlert } from './models/dashboard.model';

Chart.register(...registerables);

interface KPICard {
  title: string;
  value: string;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('balanceChart') balanceChartRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  // Expõe Math para o template Angular
  protected readonly Math = Math;

  // Ícones
  TrendingUpIcon     = TrendingUp;
  TrendingDownIcon   = TrendingDown;
  DollarSignIcon     = DollarSign;
  AlertCircleIcon    = AlertCircle;
  CalendarIcon       = Calendar;
  ArrowUpIcon        = ArrowUpRight;
  ArrowDownIcon      = ArrowDownRight;
  ArrowRightLeftIcon = ArrowRightLeft;
  PlusIcon           = Plus;
  BarChartIcon       = BarChart3;
  CreditCardIcon     = CreditCard;

  // ==========================================
  // Signals de Estado
  // ==========================================
  loading            = signal(true);
  error              = signal<string | null>(null);
  summary            = signal<DashboardSummary | null>(null);
  charts             = signal<DashboardCharts | null>(null);
  recentTransactions = signal<RecentTransaction[]>([]);
  alerts             = signal<UpcomingAlert[]>([]);
  chartPeriod        = signal<3 | 6 | 12>(6);

  // ==========================================
  // Computed Signals
  // ==========================================
  userName = computed(() => this.authService.currentUser()?.nome ?? 'Usuário');

  kpis = computed<KPICard[]>(() => {
    const d = this.summary();
    if (!d) return [];
    return [
      {
        title:   'Saldo Atual',
        value:   this.formatCurrency(d.saldo_total),
        subtitle: d.mes_referencia,
        trend:   d.saldo_total >= 0 ? 'up' : 'down',
        icon:    DollarSign,
        color:   d.saldo_total >= 0 ? 'text-emerald-600' : 'text-red-600',
        bgColor: d.saldo_total >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      },
      {
        title:   'Receitas do Mês',
        value:   this.formatCurrency(d.receitas_mes),
        subtitle: d.mes_referencia,
        trend:   'up',
        icon:    TrendingUp,
        color:   'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title:   'Despesas do Mês',
        value:   this.formatCurrency(d.despesas_mes),
        subtitle: d.mes_referencia,
        trend:   'down',
        icon:    TrendingDown,
        color:   'text-red-500',
        bgColor: 'bg-red-50',
      },
    ];
  });

  totalAlerts  = computed(() => this.alerts().length);
  urgentAlerts = computed(() => this.alerts().filter(a => a.dias_restantes <= 2));

  chartPeriodLabel = computed(() => {
    const p = this.chartPeriod();
    if (p === 3)  return 'Últimos 3 meses';
    if (p === 12) return 'Último ano';
    return 'Últimos 6 meses';
  });

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  // ==========================================
  // Lifecycle
  // ==========================================
  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  // ==========================================
  // Carregamento de Dados
  // ==========================================
  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    let completedCount = 0;
    const total = 4;
    const checkDone = () => { if (++completedCount >= total) this.loading.set(false); };

    this.dashboardService.getSummary().subscribe({
      next: data => { this.summary.set(data); checkDone(); },
      error: err  => { this.error.set('Erro ao carregar resumo financeiro.'); console.error(err); checkDone(); },
    });

    this.dashboardService.getCharts(this.chartPeriod()).subscribe({
      next: data => {
        this.charts.set(data);
        setTimeout(() => this.initChart(), 100);
        checkDone();
      },
      error: err => { console.error('Erro ao carregar gráficos:', err); checkDone(); },
    });

    this.dashboardService.getRecentTransactions().subscribe({
      next: data => { this.recentTransactions.set(data); checkDone(); },
      error: err  => { console.error('Erro ao carregar transações:', err); checkDone(); },
    });

    this.dashboardService.getAlerts().subscribe({
      next: data => { this.alerts.set(data); checkDone(); },
      error: err  => { console.error('Erro ao carregar alertas:', err); checkDone(); },
    });
  }

  // ==========================================
  // Gráfico
  // ==========================================
  changeChartPeriod(meses: 3 | 6 | 12): void {
    this.chartPeriod.set(meses);
    this.dashboardService.getCharts(meses).subscribe({
      next: data => {
        this.charts.set(data);
        setTimeout(() => this.initChart(), 100);
      },
      error: err => console.error('Erro ao atualizar gráfico:', err),
    });
  }

  initChart(): void {
    if (!this.balanceChartRef) return;
    const ctx = this.balanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartsData = this.charts();
    if (!chartsData?.gastos_mensais?.length) return;

    this.chart?.destroy();

    const labels = chartsData.gastos_mensais.map(g => this.formatMonthLabel(g.mes));
    const values = chartsData.gastos_mensais.map(g => g.total);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Gastos',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: c => `Gastos: ${this.formatCurrency(c.parsed.y)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: v => `R$ ${Number(v).toLocaleString('pt-BR')}` },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // ==========================================
  // Quick Actions
  // ==========================================
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // ==========================================
  // Formatação
  // ==========================================
  formatCurrency(value: number | undefined | null): string {
    return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatRelativeDays(dias: number): string {
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence amanhã';
    if (dias < 0)   return `Venceu há ${Math.abs(dias)} dia${Math.abs(dias) > 1 ? 's' : ''}`;
    return `Vence em ${dias} dias`;
  }

  formatMonthLabel(mes: string): string {
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const [year, month] = mes.split('-');
    return `${meses[parseInt(month, 10) - 1]}/${year.slice(2)}`;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  getAlertBadgeClass(tipo: UpcomingAlert['tipo']): string {
    const map: Record<string, string> = {
      danger:  'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info:    'bg-blue-50 border-blue-200 text-blue-800',
    };
    return map[tipo] ?? map['info'];
  }

  getAlertIconClass(tipo: UpcomingAlert['tipo']): string {
    const map: Record<string, string> = {
      danger:  'text-red-500',
      warning: 'text-yellow-500',
      info:    'text-blue-500',
    };
    return map[tipo] ?? map['info'];
  }

  getTransactionIcon(tipo: RecentTransaction['tipo']): any {
    if (tipo === 'Renda')   return ArrowUpRight;
    if (tipo === 'Despesa') return ArrowDownRight;
    return ArrowRightLeft;
  }

  getTransactionColor(tipo: RecentTransaction['tipo']): string {
    if (tipo === 'Renda')   return 'text-emerald-600';
    if (tipo === 'Despesa') return 'text-red-500';
    return 'text-gray-500';
  }

  getTransactionBg(tipo: RecentTransaction['tipo']): string {
    if (tipo === 'Renda')   return 'bg-emerald-50';
    if (tipo === 'Despesa') return 'bg-red-50';
    return 'bg-gray-100';
  }
}
