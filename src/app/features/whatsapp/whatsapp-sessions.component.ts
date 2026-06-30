import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, timer } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { LucideAngularModule, RefreshCw, Wifi, WifiOff, Loader, X, Smartphone } from 'lucide-angular';
import { WhatsappService } from './services/whatsapp.service';
import { ToastService } from '../../shared/services/toast.service';
import { BotSession } from './models/whatsapp.model';

type ConnectStep = 'idle' | 'connecting' | 'waiting_qr' | 'connected' | 'error';

@Component({
  selector: 'app-whatsapp-sessions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './whatsapp-sessions.component.html',
})
export class WhatsappSessionsComponent implements OnInit, OnDestroy {
  // Icons
  RefreshCwIcon = RefreshCw;
  WifiIcon = Wifi;
  WifiOffIcon = WifiOff;
  LoaderIcon = Loader;
  XIcon = X;
  SmartphoneIcon = Smartphone;

  // Sessions list state
  sessions = signal<BotSession[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // QR modal state
  showModal = signal(false);
  activeSession = signal<BotSession | null>(null);
  connectStep = signal<ConnectStep>('idle');
  qrDataUrl = signal<string | null>(null);
  qrExpiresAt = signal<string | null>(null);
  connectError = signal<string | null>(null);

  private stopPolling$ = new Subject<void>();
  private pollSub?: Subscription;

  constructor(
    private whatsappService: WhatsappService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  ngOnDestroy(): void {
    this.stopPolling$.next();
    this.stopPolling$.complete();
    this.pollSub?.unsubscribe();
  }

  loadSessions(): void {
    this.loading.set(true);
    this.error.set(null);
    this.whatsappService.getSessions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: sessions => this.sessions.set(sessions),
        error: err => this.error.set(err.message),
      });
  }

  openReconnectModal(session: BotSession): void {
    this.activeSession.set(session);
    this.connectStep.set('idle');
    this.qrDataUrl.set(null);
    this.qrExpiresAt.set(null);
    this.connectError.set(null);
    this.showModal.set(true);
    this.startConnect(session.session_id);
  }

  closeModal(): void {
    this.stopPolling$.next();
    this.pollSub?.unsubscribe();
    this.showModal.set(false);
    this.activeSession.set(null);
    this.connectStep.set('idle');
    this.qrDataUrl.set(null);
  }

  disconnect(session: BotSession): void {
    this.whatsappService.disconnectSession(session.session_id).subscribe({
      next: () => {
        this.toast.success('Desconectado', `Sessão "${session.session_name}" desconectada.`);
        this.loadSessions();
      },
      error: err => this.toast.error('Erro', err.message),
    });
  }

  private startConnect(sessionId: string): void {
    this.connectStep.set('connecting');
    this.whatsappService.connectSession(sessionId).subscribe({
      next: resp => {
        if (resp.data?.status === 'connected') {
          this.connectStep.set('connected');
          this.toast.success('Conectado!', 'Sessão já está conectada.');
          this.loadSessions();
          setTimeout(() => this.closeModal(), 1500);
        } else {
          this.connectStep.set('waiting_qr');
          this.startQrPolling(sessionId);
        }
      },
      error: err => {
        this.connectStep.set('error');
        this.connectError.set(err.message);
      },
    });
  }

  private startQrPolling(sessionId: string): void {
    this.stopPolling$.next();

    this.pollSub = timer(500, 8000)
      .pipe(
        switchMap(() => this.whatsappService.getQr(sessionId)),
        takeUntil(this.stopPolling$)
      )
      .subscribe({
        next: resp => {
          // Session connected (QR scanned)
          if (resp.data?.status === 'connected' || resp.data?.phone_number) {
            this.connectStep.set('connected');
            this.stopPolling$.next();
            this.toast.success('WhatsApp conectado!', `Número: ${resp.data.phone_number || ''}`);
            this.loadSessions();
            setTimeout(() => this.closeModal(), 2000);
            return;
          }
          // QR available
          if (resp.data?.qr_code) {
            this.qrDataUrl.set(resp.data.qr_code);
            this.qrExpiresAt.set(resp.data.expires_at ?? null);
          }
        },
        error: err => {
          // Log but keep polling — transient errors are expected
          console.warn('[QR Poll]', err.message);
        },
      });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      connected: 'Conectado',
      connecting: 'Conectando',
      disconnected: 'Desconectado',
      error: 'Erro',
    };
    return map[status] ?? status;
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      connected: 'badge-success',
      connecting: 'badge-warning',
      disconnected: 'badge-error',
      error: 'badge-error',
    };
    return map[status] ?? 'badge-ghost';
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
