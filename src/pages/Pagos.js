import { useState, useEffect } from 'react';
import { pagos as pagosApi, clientes as clientesApi } from '../services/api';
import './Pagos.css';

function ModalPago({ clientes, onClose, onSave }) {
  const [form, setForm] = useState({
    cliente_id: '', monto: '', metodo_pago: 'efectivo', referencia: '',
    fecha_pago: new Date().toISOString().split('T')[0]
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'cliente_id') {
      const cliente = clientes.find(c => c.id === parseInt(value));
      if (cliente) updated.monto = cliente.monto_mensual;
    }
    setForm(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await pagosApi.crear(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700 }}>Registrar Pago</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Cliente *</label>
            <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} — Q{parseFloat(c.monto_mensual).toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Monto (Q) *</label>
              <input name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Fecha *</label>
              <input name="fecha_pago" type="date" value={form.fecha_pago} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Método de Pago</label>
              <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="deposito">Depósito</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="form-group">
              <label>Referencia</label>
              <input name="referencia" value={form.referencia} onChange={handleChange} placeholder="Opcional" />
            </div>
          </div>
          {error && <div className="login-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : '✓ Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Pagos() {
  const [lista, setLista] = useState([]);
  const [clientesList, setClientesList] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);

  const cargar = () => {
    Promise.all([pagosApi.listar(), clientesApi.listar()])
      .then(([pagosRes, clientesRes]) => {
        setLista(pagosRes.data?.pagos || pagosRes.data || []);
        setClientesList(clientesRes.data?.clientes || clientesRes.data || []);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const metodoBadge = metodo => {
    const map = { efectivo: 'green', transferencia: 'blue', deposito: 'purple', tarjeta: 'yellow' };
    return `badge badge-${map[metodo] || 'blue'}`;
  };

  const totalHoy = lista
    .filter(p => p.fecha_pago === new Date().toISOString().split('T')[0])
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pagos</h1>
          <p className="page-subtitle">{lista.length} pagos registrados · Hoy: Q {totalHoy.toFixed(2)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Registrar Pago
        </button>
      </div>

      <div className="card">
        {cargando ? (
          <div className="loading">Cargando pagos...</div>
        ) : lista.length === 0 ? (
          <div className="empty">
            <h3>Sin pagos registrados</h3>
            <p>Registra el primer pago con el botón de arriba</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Referencia</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: 12 }}>{String(p.id).padStart(3, '0')}</td>
                  <td><strong>{p.cliente_nombre || `Cliente #${p.cliente_id}`}</strong></td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 600 }}>Q {parseFloat(p.monto).toFixed(2)}</td>
                  <td><span className={metodoBadge(p.metodo_pago)}>{p.metodo_pago || '—'}</span></td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{p.referencia || '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                    {new Date(p.fecha_pago).toLocaleDateString('es-GT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ModalPago
          clientes={clientesList}
          onClose={() => setModal(false)}
          onSave={() => { setModal(false); cargar(); }}
        />
      )}
    </div>
  );
}
