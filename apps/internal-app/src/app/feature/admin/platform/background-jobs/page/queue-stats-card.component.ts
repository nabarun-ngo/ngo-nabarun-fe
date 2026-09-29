import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { QueueOverview } from '../domain';

type QueueMetricTone = 'waiting' | 'active' | 'delayed' | 'completed' | 'failed' | 'total';

interface QueueMetric {
  tone: QueueMetricTone;
  label: string;
  value: number;
  /** Highlights the pill when the count is worth reacting to. */
  attention: boolean;
}

interface QueueFact {
  label: string;
  value: string;
}

const SUMMARY_TONES: QueueMetricTone[] = ['waiting', 'active', 'failed'];

@Component({
  selector: 'app-queue-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './queue-stats-card.component.html',
  styleUrls: ['./queue-stats-card.component.scss'],
})
export class QueueStatsCardComponent {
  @Input() overview: QueueOverview | null = null;
  @Input() loading = false;
  @Input() canManageQueue = false;
  @Input() canClean = false;

  @Output() refresh = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() resume = new EventEmitter<void>();
  @Output() clearOldJobs = new EventEmitter<void>();

  protected expanded = true;

  protected toggle(): void {
    this.expanded = !this.expanded;
  }

  protected get healthTone(): 'success' | 'warning' | 'danger' {
    if (!this.overview) return 'warning';
    if (this.overview.paused) return 'warning';
    return this.overview.status.toLowerCase() === 'healthy' ? 'success' : 'danger';
  }

  protected get healthLabel(): string {
    if (!this.overview) return 'Unknown';
    return this.overview.status || 'unknown';
  }

  protected get metrics(): QueueMetric[] {
    const stats = this.overview;
    if (!stats) return [];
    return [
      { tone: 'waiting', label: 'Waiting', value: stats.waiting, attention: false },
      { tone: 'active', label: 'Active', value: stats.active, attention: false },
      { tone: 'delayed', label: 'Delayed', value: stats.delayed, attention: false },
      { tone: 'completed', label: 'Completed', value: stats.completed, attention: false },
      { tone: 'failed', label: 'Failed', value: stats.failed, attention: stats.failed > 0 },
      { tone: 'total', label: 'Total', value: stats.total, attention: false },
    ];
  }

  protected get summaryMetrics(): QueueMetric[] {
    return this.metrics.filter(metric => SUMMARY_TONES.includes(metric.tone));
  }

  protected get facts(): QueueFact[] {
    const stats = this.overview;
    if (!stats) return [];
    return [
      { label: 'Success', value: this.formatRate(stats.successRate) },
      { label: 'Failure', value: this.formatRate(stats.failureRate) },
      { label: 'Avg run', value: this.formatDuration(stats.averageProcessingTime) },
      { label: 'Slowest', value: this.formatDuration(stats.slowestJob) },
    ];
  }

  private formatRate(rate: number | undefined): string {
    if (rate === undefined || Number.isNaN(rate)) return '—';
    return `${Math.round(rate)}%`;
  }

  private formatDuration(milliseconds: number | undefined): string {
    if (!milliseconds || milliseconds < 0) return '—';
    if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`;
    return `${(milliseconds / 1000).toFixed(1)} s`;
  }
}
