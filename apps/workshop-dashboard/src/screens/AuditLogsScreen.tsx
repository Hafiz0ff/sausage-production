import type { AuditLogRecord } from '../domain/types';

interface AuditLogsScreenProps {
  auditLogs: AuditLogRecord[];
}

export function AuditLogsScreen({ auditLogs }: AuditLogsScreenProps) {
  return (
    <div className="card" style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="card-title">Журнал аудита</h2>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Событие</th>
              <th>Сущность</th>
              <th>ID Сущности</th>
              <th>Пользователь</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Нет данных</td>
              </tr>
            ) : null}
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td><span className="badge badge-neutral">{log.action}</span></td>
                <td>{log.entityKind}</td>
                <td><span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>{log.entityId.slice(0, 8)}...</span></td>
                <td>{log.userName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
