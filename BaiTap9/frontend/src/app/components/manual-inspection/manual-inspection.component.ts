import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetroService } from '../../services/metro.service';
import { InspectionResult } from '../../models/user.model';

@Component({
  selector: 'app-manual-inspection',
  imports: [FormsModule],
  template: `
    <div class="inspection-page">
      <div class="card">
        <h1>Manual Inspection</h1>
        <p>Create manual inspection records</p>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Ticket Code</label>
            <input type="text" [(ngModel)]="ticketCode" name="ticketCode" placeholder="e.g. TKT001" required />
          </div>
          <div class="form-group">
            <label>Reason for Inspection <span class="required">*</span></label>
            <textarea [(ngModel)]="reason" name="reason" rows="4" placeholder="Enter reason for manual inspection..." required></textarea>
          </div>
          <button type="submit" [disabled]="loading()">Create Inspection Record</button>
        </form>

        @if (error()) {
          <div class="alert error">{{ error() }}</div>
        }

        @if (result()) {
          <div class="result-box status-{{ result()!.status }}">
            <div class="result-icon">
              @if (result()!.status === 'PENDING_SUPERVISOR_REVIEW') { P }
              @else if (result()!.status === 'APPROVED') { OK }
              @else { X }
            </div>
            <div class="result-content">
              <strong>{{ statusLabel(result()!.status) }}</strong>
              @if (result()!.inspectionId) {
                <p>Inspection ID: {{ result()!.inspectionId }}</p>
              }
            </div>
          </div>
        }
      </div>

      @if (history().length > 0) {
        <div class="card">
          <h3>Recent Inspections</h3>
          <table>
            <thead>
              <tr><th>Ticket</th><th>Reason</th><th>Status</th><th>Time</th></tr>
            </thead>
            <tbody>
              @for (item of history(); track item.timestamp) {
                <tr>
                  <td class="mono">{{ item.code }}</td>
                  <td class="reason">{{ item.reason }}</td>
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
    .inspection-page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 1.8rem; margin: 0 0 8px; color: #1e293b; }
    p { color: #64748b; margin: 0 0 20px; }
    h3 { font-size: 1.1rem; margin: 0 0 16px; color: #1e293b; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .required { color: #dc2626; }
    input, textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; font-family: inherit; box-sizing: border-box; }
    input:focus, textarea:focus { outline: none; border-color: #3b82f6; }
    button { padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover:not(:disabled) { background: #2563eb; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert { padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 0.9rem; }
    .alert.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .result-box { display: flex; gap: 16px; padding: 16px; border-radius: 8px; margin-top: 16px; }
    .status-PENDING_SUPERVISOR_REVIEW { background: #fffbeb; border: 1px solid #fde68a; }
    .status-APPROVED { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .status-REJECTED { background: #fef2f2; border: 1px solid #fecaca; }
    .result-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .status-PENDING_SUPERVISOR_REVIEW .result-icon { background: #ca8a04; color: white; }
    .status-APPROVED .result-icon { background: #16a34a; color: white; }
    .status-REJECTED .result-icon { background: #dc2626; color: white; }
    .result-content strong { display: block; font-size: 1rem; }
    .result-content p { margin: 4px 0 0; font-size: 0.875rem; color: #64748b; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
    th { color: #6b7280; font-weight: 500; text-transform: uppercase; font-size: 0.75rem; }
    .mono { font-family: monospace; }
    .reason { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .badge-PENDING_SUPERVISOR_REVIEW { background: #fef9c3; color: #ca8a04; }
    .badge-APPROVED { background: #dcfce7; color: #15803d; }
    .badge-REJECTED { background: #fee2e2; color: #dc2626; }
  `],
})
export class ManualInspectionComponent {
  private metroService = inject(MetroService);

  ticketCode = '';
  reason = '';
  loading = signal(false);
  error = signal('');
  result = signal<InspectionResult | null>(null);
  history = signal<Array<{ code: string; reason: string; status: string; timestamp: string }>>([]);

  onSubmit() {
    this.error.set('');
    this.result.set(null);

    if (!this.ticketCode.trim() || !this.reason.trim()) {
      this.error.set('Please enter ticket code and reason');
      return;
    }

    this.loading.set(true);
    this.metroService.manualInspection(this.ticketCode.trim(), this.reason.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.history.update((h) => [
          { code: this.ticketCode.trim(), reason: this.reason.trim(), status: res.status, timestamp: new Date().toLocaleString() },
          ...h,
        ].slice(0, 10));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const e = err as { message?: string };
        this.error.set(e.message || 'Inspection failed');
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_SUPERVISOR_REVIEW: 'PENDING - Awaiting Supervisor Review',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
    };
    return labels[status] || status;
  }
}
