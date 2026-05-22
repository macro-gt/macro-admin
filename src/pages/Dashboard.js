import { useState, useEffect } from 'react';
import { dashboard } from '../services/api';
import './Dashboard.css';

const StatCard = ({ label, value, icon, color, prefix }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboard.get()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="loading">Cargando dashboard...</div>;

  const stats = data?.estadisticas || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general del sistema</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Clientes Activos" value={stats.clientes_activos || 0} icon="◉" color="blue" />
        <StatCard label="Vencen Hoy" value={stats.vencen_hoy || 0} icon="◷" color="yellow" />
        <StatCard label="En Mora" value={stats.en_mora || 0} icon="⚠" color="red" />
        <StatCard label="Pagos Hoy" value={stats.pagos_hoy || 0} icon="◆" color="green" />
        <StatCard label="Recaudado Hoy" value={stats.recaudado_hoy || 0} icon="Q" color="green" prefix="Q " />
        <StatCard label="Notificaciones" value={stats.notificaciones_hoy || 0} icon="◈" color="purple" />
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Próximos a Vencer</h2>
        {data?.proximos_vencer?.length > 0 ? (
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Monto</th>
                  <th>Día de Pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.proximos_vencer.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.nombre}</strong></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{c.telefono}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>Q {parseFloat(c.monto_mensual).toFixed(2)}</td>
                    <td>Día {c.dia_pago}</td>
                    <td><span className="badge badge-yellow">Por vencer</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty">
            <h3>Sin vencimientos próximos</h3>
            <p>No hay clientes con pagos próximos a vencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
