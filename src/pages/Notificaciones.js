import { useState } from 'react';
import './Notificaciones.css';

const CLIENTES_DEMO = [
  { id: 1, nombre: 'Juan García', telefono: '50299991111', servicio: 'Internet', monto: 150, estado: 'mora' },
  { id: 2, nombre: 'María López', telefono: '50299992222', servicio: 'Cámaras', monto: 200, estado: 'por_vencer' },
  { id: 3, nombre: 'Carlos Pérez', telefono: '50299993333', servicio: 'Internet', monto: 150, estado: 'por_vencer' },
  { id: 4, nombre: 'Ana Fuentes', telefono: '50299994444', servicio: 'Soporte TI', monto: 300, estado: 'mora' },
  { id: 5, nombre: 'Jorge Ramírez', telefono: '50299995555', servicio: 'Internet', monto: 150, estado: 'activo' },
];

const NOTIFICACIONES_DEMO = [
  { id: 1, cliente: 'Juan García', tipo: 'recordatorio_mora', estado: 'enviado', hora: '09:15', telefono: '50299991111' },
  { id: 2, cliente: 'María López', tipo: 'aviso_preventivo', estado: 'enviado', hora: '09:16', telefono: '50299992222' },
  { id: 3, cliente: 'Carlos Pérez', tipo: 'aviso_preventivo', estado: 'enviado', hora: '09:16', telefono: '50299993333' },
  { id: 4, cliente: 'Ana Fuentes', tipo: 'recordatorio_mora', estado: 'fallido', hora: '09:17', telefono: '50299994444' },
  { id: 5, cliente: 'Pedro Xol', tipo: 'confirmacion_pago', estado: 'enviado', hora: '10:32', telefono: '50299996666' },
];

const TIPOS = {
  aviso_preventivo: { label: 'Aviso preventivo', color: 'yellow' },
  recordatorio_mora: { label: 'Recordatorio mora', color: 'red' },
  confirmacion_pago: { label: 'Confirmación pago', color: 'green' },
  mantenimiento: { label: 'Mantenimiento', color: 'blue' },
};

export default function Notificaciones() {
  const [seleccionados, setSeleccionados] = useState([]);
  const [tipoEnvio, setTipoEnvio] = useState('aviso_preventivo');
  const [filtroServicio, setFiltroServicio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviados, setEnviados] = useState(0);

  const clientesFiltrados = CLIENTES_DEMO.filter(c =>
    filtroServicio ? c.servicio === filtroServicio : true
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
        setSeleccionados([]);
      }
    }, 400);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notificaciones</h1>
          <p className="page-subtitle">Centro de notificaciones WhatsApp</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="notif-stats">
        <div className="notif-stat">
          <div className="ns-value green">24</div>
          <div className="ns-label">Enviados hoy</div>
        </div>
        <div className="notif-stat">
          <div className="ns-value yellow">3</div>
          <div className="ns-label">Pendientes</div>
        </div>
        <div className="notif-stat">
          <div className="ns-value red">1</div>
          <div className="ns-label">Fallidos</div>
        </div>
        <div className="notif-stat">
          <div className="ns-value blue">156</div>
          <div className="ns-label">Este mes</div>
        </div>
      </div>

      <div className="notif-layout">
        {/* Envío masivo */}
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
                <option value="Internet">Internet</option>
                <option value="Cámaras">Cámaras</option>
                <option value="Soporte TI">Soporte TI</option>
                <option value="VoIP">VoIP</option>
              </select>
            </div>
          </div>

          <div className="clientes-lista">
            <div className="lista-header">
              <label className="checkbox-label">
                <input type="checkbox"
                  checked={seleccionados.length === clientesFiltrados.length}
                  onChange={toggleTodos} />
                Seleccionar todos ({clientesFiltrados.length})
              </label>
              <span className="seleccionados-count">{seleccionados.length} seleccionados</span>
            </div>
            {clientesFiltrados.map(c => (
              <div key={c.id} className={`cliente-row ${seleccionados.includes(c.id) ? 'selected' : ''}`}>
                <label className="checkbox-label">
                  <input type="checkbox"
                    checked={seleccionados.includes(c.id)}
                    onChange={() => toggleSeleccion(c.id)} />
                  <div className="cr-info">
                    <strong>{c.nombre}</strong>
                    <span>{c.servicio} · Q{c.monto}</span>
                  </div>
                </label>
                <span className={`badge badge-${c.estado === 'mora' ? 'red' : c.estado === 'por_vencer' ? 'yellow' : 'green'}`}>
                  {c.estado === 'mora' ? 'En mora' : c.estado === 'por_vencer' ? 'Por vencer' : 'Activo'}
                </span>
              </div>
            ))}
          </div>

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

        {/* Historial */}
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>Historial de hoy</h2>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICACIONES_DEMO.map(n => (
                <tr key={n.id}>
                  <td>
                    <strong>{n.cliente}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{n.telefono}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${TIPOS[n.tipo]?.color || 'blue'}`}>
                      {TIPOS[n.tipo]?.label}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${n.estado === 'enviado' ? 'green' : 'red'}`}>
                      {n.estado === 'enviado' ? '✓ Enviado' : '✗ Fallido'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{n.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
