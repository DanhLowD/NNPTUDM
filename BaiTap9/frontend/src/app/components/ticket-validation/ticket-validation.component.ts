import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetroService } from '../../services/metro.service';
import { TicketValidationResult } from '../../models/user.model';

@Component({
  selector: 'app-ticket-validation',
  imports: [FormsModule],
  template: `
    <div class="validation-page">
      <div class="card">
        <h1>Validate Ticket</h1>
        <p>Validate tickets at the gate</p>
      </div>

      <div class="card">
        <form (ngSubmit)="onValidate()">
          <div class="form-row">
            <div class="form-group">
              <label>Ticket Code</label>
              <input type="text" [(ngModel)]="ticketCode" name="ticketCode" placeholder="e.g. TKT001" required />
            </div>
            <div class="form-group">
              <label>Station Code</label>
              <input type="text" [(ngModel)]="stationCode" name="stationCode" placeholder="e.g. ST01" required />
            </div>
          </div>
          <button type="submit" [disabled]="loading()">Validate Ticket</button>
        </form>

        @if (error()) {
          <div class="alert error">{{ error() }}</div>
        }

        @if (result()) {
          <div class="result-box status-{{ result()!.status }}">
            <div class="result-icon">
              @if (result()!.status === 'ALLOW_ENTRY') { OK }
              @else if (result()!.status === 'DENY_ENTRY') { X }
              @else if (result()!.status === 'EXPIRED') { E }
              @else { F }
            </div>
            <div class="result-content">
              <strong>{{ statusLabel(result()!.status) }}</strong>
              @if (result()!.message) {
                <p>{{ result()!.message }}</p>
              }
            </div>
          </div>
        }
      </div>

      @if (history().length > 0) {
        <div class="card">
          <h3>Recent Validations</h3>
          <table>
            <thead>
              <tr><th>Ticket</th><th>Station</th><th>Status</th><th>Time</th></tr>
            </thead>
            <tbody>
              @for (item of history(); track item.timestamp) {
                <tr>
                  <td class="mono">{{ item.code }}</td>
                  <td class="mono">{{ item.station }}</td>
                  <td><span class="badge badge-{{ item.status }}">{{ item.status }}</span></td>
                  <td>{{ item.timestamp }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .validation-page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 1.8rem; margin: 0 0 8px; color: #1e293b; }
    p { color: #64748b; margin: 0 0 20px; }
    h3 { font-size: 1.1rem; margin: 0 0 16px; color: #1e293b; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    input { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; }
    input:focus { outline: none; border-color: #3b82f6; }
    button { padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover:not(:disabled) { background: #2563eb; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert { padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 0.9rem; }
    .alert.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .result-box { display: flex; gap: 16px; padding: 16px; border-radius: 8px; margin-top: 16px; }
    .status-ALLOW_ENTRY { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .status-DENY_ENTRY { background: #fef2f2; border: 1px solid #fecaca; }
    .status-EXPIRED { background: #fffbeb; border: 1px solid #fde68a; }
    .result-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
    .status-ALLOW_ENTRY .result-icon { background: #16a34a; color: white; }
    .status-DENY_ENTRY .result-icon { background: #dc2626; color: white; }
    .status-EXPIRED .result-icon { background: #ca8a04; color: white; }
    .result-content strong { display: block; font-size: 1rem; }
    .result-content p { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
    th { color: #6b7280; font-weight: 500; text-transform: uppercase; font-size: 0.75rem; }
    .mono { font-family: monospace; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .badge-ALLOW_ENTRY { background: #dcfce7; color: #15803d; }
    .badge-DENY_ENTRY { background: #fee2e2; color: #dc2626; }
    .badge-EXPIRED { background: #fef9c3; color: #ca8a04; }
  `],
})
export class TicketValidationComponent {
  private metroService = inject(MetroService);

  ticketCode = '';
  stationCode = '';
  loading = signal(false);
  error = signal('');
  result = signal<TicketValidationResult | null>(null);
  history = signal<Array<{ code: string; station: string; status: string; timestamp: string }>>([]);

  onValidate() {
    this.error.set('');
    this.result.set(null);

    if (!this.ticketCode.trim() || !this.stationCode.trim()) {
      this.error.set('Please enter ticket code and station code');
      return;
    }

    this.loading.set(true);
    this.metroService.validateTicket(this.ticketCode.trim(), this.stationCode.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.history.update((h) => [
          { code: this.ticketCode.trim(), station: this.stationCode.trim(), status: res.status, timestamp: new Date().toLocaleString() },
          ...h,
        ].slice(0, 10));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const e = err as { message?: string };
        this.error.set(e.message || 'Validation failed');
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      ALLOW_ENTRY: 'ALLOWED - Valid Ticket',
      DENY_ENTRY: 'DENIED - Invalid Ticket',
      EXPIRED: 'EXPIRED - Ticket Expired',
      FAILED: 'FAILED',
    };
    return labels[status] || status;
  }
}
