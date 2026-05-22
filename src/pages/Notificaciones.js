import { useState, useEffect } from 'react';
import { clientes as clientesApi, pagos as pagosApi } from '../services/api';
import './Notificaciones.css';

const TIPOS = {
  aviso_preventivo: { label: 'Aviso preventivo', color: 'yellow' },
  recordatorio_mora: { label: 'Recordatorio mora', color: 'red' },
  confirmacion_pago: { label: 'Confirmación pago', color: 'green' },
  mantenimiento: { label: 'Mantenimiento', color: 'blue' },
};

export default function Notificaciones() {
  const [clientesList, setClientesList] = useState([]);
  const [pagosList, setPagosList] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionados, setSeleccionados] = useState([]);
  const [tipoEnvio, setTipoEnvio] = useState('aviso_preventivo');
  const [filtroServicio, setFiltroServicio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviados, setEnviados] = useState(0);
  const [enviadosExito, setEnviadosExito] = useState(false);

  useEffect(() => {
    Promise.all([clientesApi.listar(), pagosApi.listar()])
      .then(([cRes, pRes]) => {
        setClientesList(cRes.data?.clientes || cRes.data || []);
        setPagosList(pRes.data?.pagos || pRes.data || []);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const servicios = [...new Set(clientesList.map(c => c.servicio_nombre).filter(Boolean))];

  const clientesFiltrados = clientesList.filter(c =>
    filtroServicio ? c.servicio_nombre === filtroServicio : true
  );

  const toggleSeleccion = id => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTodos = () => {
    if (seleccionados.length === clientesFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(clientesFiltrados.map(c => c.id));
    }
  };

  const simularEnvio = () => {
    setEnviando(true);
    setEnviados(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setEnviados(count);
      if (count >= seleccionados.length) {
        clearInterval(interval);
        setEnviando(false);
        setEnviadosExito(true);
        setSeleccionados([]);
        setTimeout(() => setEnviadosExito(false), 3000);
      }
    }, 500);
  };

  const estadoCliente = c => {
    const hoy = new Date().getDate();
    if (c.estado === 'suspendido') return 'mora';
    if (Math.abs(c.dia_pago - hoy) <= 3) return 'por_vencer';
    return c.estado === 'activo' ? 'activo' : 'mora';
  };

  const pagosHoy = pagosList.filter(p =>
    p.fecha_pago === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notificaciones</h1>
          <p className="page-subtitle">Centro de notificaciones WhatsApp</p>
        </div>
      </div>

      <div className="notif-stats">
        <div className="notif-stat">
          <div className="ns-value green">{pagosHoy}</div>
          <div className="ns-label">Pagos hoy</div>
        </div>
        <div className="notif-stat">
          <div className="ns-value yellow">
            {clientesList.filter(c => estadoCliente(c) === 'por_vencer').length}
          </div>
          <div className="ns-label">Por vencer</div>
        </div>
        <div className="notif-stat">
          <div className="ns-value red">
            {clientesList.filter(c => c.estado === 'suspendido').length}
          </div>
          <div className="ns-label">Suspendidos</div>
        </div>
        <div className="notif-stat">
          <div className="ns-value blue">{clientesList.length}</div>
          <div className="ns-label">Total clientes</div>
        </div>
      </div>

      <div className="notif-layout">
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>Envío masivo por servicio</h2>

          <div className="envio-filtros">
            <div className="form-group">
              <label>Tipo de notificación</label>
              <select value={tipoEnvio} onChange={e => setTipoEnvio(e.target.value)}>
                {Object.entries(TIPOS).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Filtrar por servicio</label>
              <select value={filtroServicio} onChange={e => setFiltroServicio(e.target.value)}>
                <option value="">Todos los servicios</option>
                {servicios.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {cargando ? (
            <div className="loading">Cargando clientes...</div>
          ) : (
            <div className="clientes-lista">
              <div className="lista-header">
                <label className="checkbox-label">
                  <input type="checkbox"
                    checked={seleccionados.length === clientesFiltrados.length && clientesFiltrados.length > 0}
                    onChange={toggleTodos} />
                  Seleccionar todos ({clientesFiltrados.length})
                </label>
                <span className="seleccionados-count">{seleccionados.length} seleccionados</span>
              </div>
              {clientesFiltrados.length === 0 ? (
                <div className="empty" style={{ padding: 30 }}>
                  <p>No hay clientes registrados</p>
                </div>
              ) : clientesFiltrados.map(c => {
                const est = estadoCliente(c);
                return (
                  <div key={c.id} className={`cliente-row ${seleccionados.includes(c.id) ? 'selected' : ''}`}>
                    <label className="checkbox-label">
                      <input type="checkbox"
                        checked={seleccionados.includes(c.id)}
                        onChange={() => toggleSeleccion(c.id)} />
                      <div className="cr-info">
                        <strong>{c.nombre}</strong>
                        <span>{c.servicio_nombre || 'Sin servicio'} · Q{parseFloat(c.monto_mensual).toFixed(2)}</span>
                      </div>
                    </label>
                    <span className={`badge badge-${est === 'mora' ? 'red' : est === 'por_vencer' ? 'yellow' : 'green'}`}>
                      {est === 'mora' ? 'En mora' : est === 'por_vencer' ? 'Por vencer' : 'Activo'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {enviadosExito && (
            <div style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)', color: 'var(--green)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              ✅ Simulación completada — {enviados} mensajes enviados (requiere WhatsApp API para envío real)
            </div>
          )}

          <div className="envio-acciones">
            <button
              className="btn btn-primary"
              disabled={seleccionados.length === 0 || enviando}
              onClick={simularEnvio}
              style={{ flex: 1 }}>
              {enviando
                ? `Enviando... ${enviados}/${seleccionados.length}`
                : `📤 Enviar a ${seleccionados.length} clientes`}
            </button>
          </div>

          {enviando && (
            <div className="progreso-bar">
              <div className="progreso-fill" style={{ width: `${(enviados / seleccionados.length) * 100}%` }}></div>
            </div>
          )}
        </div>

        {/* Historial de pagos recientes */}
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>Pagos recientes</h2>
          {cargando ? (
            <div className="loading">Cargando...</div>
          ) : pagosList.length === 0 ? (
            <div className="empty">
              <h3>Sin pagos registrados</h3>
              <p>Los pagos aparecerán aquí</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pagosList.slice(0, 8).map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.cliente_nombre || `Cliente #${p.cliente_id}`}</strong>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 600 }}>
                      Q {parseFloat(p.monto).toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-green">✓ Pagado</span>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {new Date(p.fecha_pago).toLocaleDateString('es-GT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
