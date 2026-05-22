import { useState, useEffect } from 'react';
import { clientes as clientesApi } from '../services/api';
import './Clientes.css';

const SERVICIOS = ['', 'Internet', 'Cámaras', 'Soporte TI', 'VoIP', 'Cloud', 'Otro'];

function ModalCliente({ cliente, onClose, onSave }) {
  const [form, setForm] = useState(cliente || {
    nombre: '', telefono: '', email: '', dpi_nit: '',
    servicio_id: 1, plan_detalle: '', monto_mensual: '',
    dia_pago: 1, estado: 'activo'
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      if (cliente?.id) {
        await clientesApi.actualizar(cliente.id, form);
      } else {
        await clientesApi.crear(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700 }}>
          {cliente?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>DPI / NIT</label>
              <input name="dpi_nit" value={form.dpi_nit || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Servicio *</label>
              <select name="servicio_id" value={form.servicio_id} onChange={handleChange} required>
                {SERVICIOS.map((s, i) => i > 0 && <option key={i} value={i}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Plan / Detalle</label>
              <input name="plan_detalle" value={form.plan_detalle || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Monto Mensual (Q) *</label>
              <input name="monto_mensual" type="number" step="0.01" value={form.monto_mensual} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Día de Pago *</label>
              <input name="dia_pago" type="number" min="1" max="31" value={form.dia_pago} onChange={handleChange} required />
            </div>
          </div>
          {cliente?.id && (
            <div className="form-group">
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          )}
          {error && <div className="login-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = () => {
    clientesApi.listar()
      .then(res => setLista(res.data?.clientes || res.data || []))
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = lista.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  const estadoBadge = estado => {
    const map = { activo: 'green', inactivo: 'red', suspendido: 'yellow' };
    return `badge badge-${map[estado] || 'blue'}`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{lista.length} clientes registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          + Nuevo Cliente
        </button>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <input
            className="search-input"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {cargando ? (
          <div className="loading">Cargando clientes...</div>
        ) : filtrados.length === 0 ? (
          <div className="empty">
            <h3>Sin clientes</h3>
            <p>Agrega tu primer cliente con el botón de arriba</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Servicio</th>
                <th>Monto</th>
                <th>Día Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: 12 }}>{String(c.id).padStart(3, '0')}</td>
                  <td><strong>{c.nombre}</strong></td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{c.telefono}</td>
                  <td>{SERVICIOS[c.servicio_id] || '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>Q {parseFloat(c.monto_mensual).toFixed(2)}</td>
                  <td>Día {c.dia_pago}</td>
                  <td><span className={estadoBadge(c.estado)}>{c.estado}</span></td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => setModal(c)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <ModalCliente
          cliente={modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); cargar(); }}
        />
      )}
    </div>
  );
}
