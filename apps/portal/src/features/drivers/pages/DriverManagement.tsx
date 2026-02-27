import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';

// UI mẫu (local). Bạn có thể nối API sau.
const mockDrivers = [
  { id: 'd1', name: 'Nguyễn Văn A', phone: '0901 234 567', license: 'B2 - 123456', status: 'active' },
  { id: 'd2', name: 'Trần Văn B', phone: '0909 888 999', license: 'C - 987654', status: 'inactive' },
];

export function DriverManagement() {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return mockDrivers;
    return mockDrivers.filter((d) =>
      [d.name, d.phone, d.license].some((x) => x.toLowerCase().includes(query)),
    );
  }, [q]);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>Quản lý tài xế</div>
          <div style={{ color: 'var(--obtp-muted2)' }}>UI mẫu — bạn có thể nối API sau.</div>
        </div>

        <button className="obtp-btn" type="button">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Plus size={18} />
            <span>Thêm tài xế</span>
          </span>
        </button>
      </div>

      <div className="obtp-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={18} style={{ opacity: 0.8 }} />
          <input
            className="obtp-input"
            style={{ paddingLeft: 14 }}
            placeholder="Tìm theo tên / SĐT / GPLX..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="obtp-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: 14, borderBottom: '1px solid var(--obtp-border)' }}>
          <div style={{ fontWeight: 900 }}>Danh sách</div>
        </div>

        <div style={{ padding: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--obtp-muted2)', fontSize: 12, textTransform: 'uppercase' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Tài xế</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>SĐT</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>GPLX</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} style={{ borderTop: '1px solid var(--obtp-border)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 800 }}>{d.name}</td>
                  <td style={{ padding: '12px 8px' }}>{d.phone}</td>
                  <td style={{ padding: '12px 8px' }}>{d.license}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span
                      style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: '1px solid var(--obtp-border)',
                        background: d.status === 'active' ? 'rgba(34,197,94,.12)' : 'rgba(148,163,184,.10)',
                        color: d.status === 'active' ? '#22c55e' : 'var(--obtp-muted2)',
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {d.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
