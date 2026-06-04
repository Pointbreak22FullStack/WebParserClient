import { Injectable, inject, OnDestroy, NgZone } from '@angular/core';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';
import { ChangeType, HubNotification } from '../interfaces/hub-notification';
import { TaskLogEntry } from '../interfaces/task';

@Injectable({ providedIn: 'root' })
export class HubService implements OnDestroy {
  private auth = inject(AuthService);
  private zone = inject(NgZone);
  private connection: HubConnection;
  private startPromise!: Promise<void>;
  private subscribedGroups = new Set<string>();

  readonly entityChanged$ = new Subject<HubNotification>();
  readonly taskLog$ = new Subject<TaskLogEntry>();

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.auth.getAccessToken(),
      })
      .withAutomaticReconnect()
      .configureLogging(environment.production ? LogLevel.None : LogLevel.Warning)
      .build();

    const changeTypeMap: Record<number, ChangeType> = { 0: 'Created', 1: 'Updated', 2: 'Deleted' };

    // Навешиваем ДО start()
    this.connection.on('onEntityChanged', (n: any) => {
      const normalized: HubNotification = {
        ...n,
        changeType: typeof n.changeType === 'number' ? changeTypeMap[n.changeType] : n.changeType,
      };
      console.log('[HubService] onEntityChanged received:', normalized);
      this.zone.run(() => this.entityChanged$.next(normalized));
    });

    this.connection.on('onTaskLog', (entry: TaskLogEntry) => {
      this.zone.run(() => this.taskLog$.next(entry));
    });

    this.connection.onreconnected(() => {
      console.log('[HubService] Reconnected, resubscribing...');
      this.resubscribeAll();
    });

    this.startPromise = this.connection.start()
      .then(() => {
        console.log('[HubService] Connected, state:', this.connection.state);
      })
      .catch(err => {
        console.error('[HubService] Connection failed:', err);
      });
  }

  // subscribe() привязан к startPromise — invoke всегда идёт ПОСЛЕ start()
  subscribe(group: string): void {
    this.subscribedGroups.add(group);
    this.startPromise.then(() => {
      console.log(`[HubService] Invoking Subscribe("${group}"), state: ${this.connection.state}`);
      return this.connection.invoke('Subscribe', group);
    }).catch(err =>
      console.error(`[HubService] Subscribe("${group}") failed:`, err)
    );
  }

  private resubscribeAll(): void {
    this.startPromise.then(() => {
      this.subscribedGroups.forEach(group =>
        this.connection.invoke('Subscribe', group).catch(console.error)
      );
    });
  }

  ngOnDestroy(): void {
    this.connection.stop();
    this.entityChanged$.complete();
  }
}
