import { useState, useEffect } from 'react';
import { clientes as clientesApi, pagos as pagosApi } from '../services/api';
import './RegistrarPago.css';

const METODOS = ['efectivo', 'transferencia bancaria', 'depósito', 'tarjeta'];

function WhatsAppPreview({ cliente, monto, tipo }) {
  if (!cliente) return (
    <div className="wa-empty">
      <div className="wa-empty-icon">💬</div>
      <p>Selecciona un cliente para ver el mensaje</p>
    </div>
  );

  const empresa = 'MACRO Internet Residencial';
  const telefono = '+502 3000-8062';
  const fecha = new Date().toLocaleDateString('es-GT');

  const mensajes = {
    confirmacion: `✅ *${empresa}*\n\nEstimado/a *${cliente.nombre}*, hemos recibido su pago de *Q ${parseFloat(monto || cliente.monto_mensual).toFixed(2)}* por el servicio de *${cliente.servicio_nombre || 'Internet'}*.\n\n¡Gracias por su pago a tiempo! Su servicio continúa activo.\n\n📞 Soporte 24/7: ${telefono}`,
    mora: `⚠️ *${empresa}*\n\nEstimado/a *${cliente.nombre}*, su servicio de *${cliente.servicio_nombre || 'Internet'}* tiene un saldo pendiente de *Q ${parseFloat(monto || cliente.monto_mensual).toFixed(2)}*.\n\nPara evitar la suspensión del servicio, regularice su pago a la brevedad.\n\n📞 Soporte: ${telefono}`,
    recordatorio: `🔔 *${empresa}*\n\nEstimado/a *${cliente.nombre}*, le recordamos que su servicio de *${cliente.servicio_nombre || 'Internet'}* vence el *${fecha}*.\n\nMonto a pagar: *Q ${parseFloat(monto || cliente.monto_mensual).toFixed(2)}*\n\nPuede pagar por transferencia o en nuestras oficinas.\n\n📞 Soporte 24/7: ${telefono}`,
  };

  return (
    <div className="wa-preview">
      <div className="wa-header">
        <div className="wa-avatar">M</div>
        <div>
          <div className="wa-name">MACRO Cobros</div>
          <div className="wa-status">● en línea</div>
        </div>
      </div>
      <div className="wa-body">
        <div className="wa-bubble">
          {mensajes[tipo]?.split('\n').map((line, i) => (
            <span key={i}>
              {line.split(/(\*[^*]+\*)/).map((part, j) =>
                part.startsWith('*') && part.endsWith('*')
                  ? <strong key={j}>{part.slice(1, -1)}</strong>
                  : part
              )}
              <br />
            </span>
          ))}
          <span className="wa-time">{new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
        </div>
      </div>
    </div>
  );
}

export default function RegistrarPago() {
  const [clientesList, setClientesList] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [form, setForm] = useState({
    cliente_id: '', monto: '', metodo_pago: 'efectivo',
    referencia: '', fecha_pago: new Date().toISOString().split('T')[0]
  });
  const [tipoMensaje, setTipoMensaje] = useState('confirmacion');
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clientesApi.listar()
      .then(res => setClientesList(res.data?.clientes || res.data || []))
      .catch(console.error);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'cliente_id') {
      const c = clientesList.find(c => c.id === parseInt(value));
      setClienteSeleccionado(c || null);
      if (c) updated.monto = c.monto_mensual;
    }
    setForm(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await pagosApi.crear(form);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
      setForm({ cliente_id: '', monto: '', metodo_pago: 'efectivo', referencia: '', fecha_pago: new Date().toISOString().split('T')[0] });
      setClienteSeleccionado(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar Pago</h1>
          <p className="page-subtitle">Registra el pago y previsualiza la notificación WhatsApp</p>
        </div>
      </div>

      <div className="pago-layout">
        {/* Formulario */}
        <div className="card pago-form-card">
          <h2 className="section-title" style={{marginBottom: 20}}>Datos del pago</h2>
          {exito && (
            <div className="pago-exito">✅ Pago registrado correctamente</div>
          )}
          <form onSubmit={handleSubmit} className="pago-form">
            <div className="form-group">
              <label>Cliente *</label>
              <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
                <option value="">Seleccionar cliente...</option>
                {clientesList.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — Q{parseFloat(c.monto_mensual).toFixed(2)}</option>
                ))}
              </select>
            </div>

            {clienteSeleccionado && (
              <div className="cliente-info-card">
                <div className="ci-row"><span>Teléfono</span><strong>{clienteSeleccionado.telefono}</strong></div>
                <div className="ci-row"><span>Servicio</span><strong>{clienteSeleccionado.servicio_nombre || '—'}</strong></div>
                <div className="ci-row"><span>Monto mensual</span><strong>Q {parseFloat(clienteSeleccionado.monto_mensual).toFixed(2)}</strong></div>
                <div className="ci-row"><span>Estado</span>
                  <span className={`badge badge-${clienteSeleccionado.estado === 'activo' ? 'green' : 'red'}`}>{clienteSeleccionado.estado}</span>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Monto recibido (Q) *</label>
                <input name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Fecha de pago *</label>
                <input name="fecha_pago" type="date" value={form.fecha_pago} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Método de pago</label>
                <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
                  {METODOS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>No. de recibo / Referencia</label>
                <input name="referencia" value={form.referencia} onChange={handleChange} placeholder="Ej. TRF-2026-0542" />
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de mensaje WhatsApp</label>
              <div className="tipo-btns">
                {[['confirmacion','✅ Confirmación'], ['recordatorio','🔔 Recordatorio'], ['mora','⚠️ Mora']].map(([val, label]) => (
                  <button key={val} type="button"
                    className={`tipo-btn ${tipoMensaje === val ? 'active' : ''}`}
                    onClick={() => setTipoMensaje(val)}>{label}</button>
                ))}
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={guardando}>
                {guardando ? 'Guardando...' : '✓ Confirmar y registrar'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview WhatsApp */}
        <div className="wa-card">
          <h2 className="section-title" style={{ marginBottom: 16 }}>Mensaje que se enviará automáticamente</h2>
          <WhatsAppPreview cliente={clienteSeleccionado} monto={form.monto} tipo={tipoMensaje} />
          <p className="wa-disclaimer">* Vista previa del mensaje. El envío real requiere configurar WhatsApp API.</p>
        </div>
      </div>
    </div>
  );
}
