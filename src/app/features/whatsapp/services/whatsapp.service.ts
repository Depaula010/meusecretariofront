import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BotSession, BotSessionsResponse, ConnectResponse, QrResponse } from '../models/whatsapp.model';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly BASE = environment.bot.apiUrl;

  constructor(private http: HttpClient) {}

  // A X-API-Key do bot NÃO é enviada pelo navegador: o proxy (proxy.conf.js em dev, proxy reverso em produção) a injeta.
  private get headers(): HttpHeaders {
    return new HttpHeaders();
  }

  getSessions(): Observable<BotSession[]> {
    return this.http
      .get<BotSessionsResponse>(`${this.BASE}/sessions`, { headers: this.headers })
      .pipe(
        map(r => r.data),
        catchError(this.handleError)
      );
  }

  connectSession(sessionId: string): Observable<ConnectResponse> {
    return this.http
      .post<ConnectResponse>(`${this.BASE}/sessions/${sessionId}/connect`, {}, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getQr(sessionId: string): Observable<QrResponse> {
    return this.http
      .get<QrResponse>(`${this.BASE}/sessions/${sessionId}/qr`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  disconnectSession(sessionId: string): Observable<ConnectResponse> {
    return this.http
      .post<ConnectResponse>(`${this.BASE}/sessions/${sessionId}/disconnect`, {}, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.message || `Erro ${error.status}: falha na comunicação com o bot`;
    return throwError(() => new Error(msg));
  }
}
