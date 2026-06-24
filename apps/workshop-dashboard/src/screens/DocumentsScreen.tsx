import type { DocumentRecord } from '../domain/types';

interface DocumentsScreenProps {
  documents: DocumentRecord[];
}

export function DocumentsScreen({ documents }: DocumentsScreenProps) {
  return (
    <div className="card" style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="card-title">Документы</h2>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Номер</th>
              <th>Тип</th>
              <th>Статус</th>
              <th>Заголовок</th>
              <th className="text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Нет данных</td>
              </tr>
            ) : null}
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>{new Date(doc.createdAt).toLocaleString()}</td>
                <td>{doc.number}</td>
                <td>{doc.type}</td>
                <td>
                  <span className={`badge badge-${doc.status === 'POSTED' ? 'success' : doc.status === 'CANCELLED' ? 'danger' : 'neutral'}`}>
                    {doc.status}
                  </span>
                </td>
                <td>{doc.title || '-'}</td>
                <td className="text-right">{doc.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
