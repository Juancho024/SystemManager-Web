import { useState, useMemo, useEffect } from 'react'

function VistaContabilidad({ owners }) {
  const [searchMonth, setSearchMonth] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showInforme, setShowInforme] = useState(false)
  const [registros, setRegistros] = useState([])
  const [registroActual, setRegistroActual] = useState(null)
  const [cuotasDetalle, setCuotasDetalle] = useState([])
  const apiBase = import.meta.env.VITE_API_BASE

  // Cargar registros al montar
  useEffect(() => {
    const cargarRegistros = async () => {
      try {
        const response = await fetch(`${apiBase}/api/registro-financiero`)
        if (response.ok) {
          const data = await response.json()
          setRegistros(Array.isArray(data) ? data : [])
        }
      } catch {
        console.warn('Error al cargar registros')
        setRegistros([])
      }
    }
    cargarRegistros()
  }, [apiBase])

  // Buscar registro financiero por mes
  useEffect(() => {
    if (!searchMonth.trim()) {
      setRegistroActual(null)
      setCuotasDetalle([])
      return
    }

    const registroEncontrado = registros.find(r =>
      r.mesCuota?.toLowerCase() === searchMonth.toLowerCase()
    )

    if (registroEncontrado) {
      setRegistroActual(registroEncontrado)

      // Calcular balance acumulado hasta ese mes
      const balanceAcumulado = calcularMontoDebidoHastaMes(searchMonth)

      // Generar detalle para cada propietario
      const detalles = owners.map(owner => ({
        ...owner,
        cuotaMensual: registroEncontrado.cuotaMensual,
        descripcion: registroEncontrado.descripcion,
        montoPagar: registroEncontrado.montoPagar,
        balance: (owner.totalabonado || 0) - balanceAcumulado
      }))

      setCuotasDetalle(detalles)
    } else {
      setRegistroActual(null)
      setCuotasDetalle([])
    }
  }, [searchMonth, registros, owners])

  const handleOpenModal = async () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleOpenInforme = () => {
    setShowInforme(true)
  }

  const handleCloseInforme = () => {
    setShowInforme(false)
  }

  const parseMonth = (mesCuota) => {
    try {
      if (!mesCuota || !mesCuota.includes('-')) return null
      const [nombreMes, anio] = mesCuota.split('-')
      const meses = {
        'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
        'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
      }
      const numeroMes = meses[nombreMes.toLowerCase().trim()] || 1
      return new Date(parseInt(anio), numeroMes - 1)
    } catch {
      return null
    }
  }

  const calcularMontoDebidoHastaMes = (mesLimite) => {
    const fechaLimite = parseMonth(mesLimite)
    if (!fechaLimite) return 0

    return registros.reduce((total, registro) => {
      const fechaRegistro = parseMonth(registro.mesCuota)
      if (fechaRegistro && fechaRegistro <= fechaLimite) {
        return total + (registro.montoPagar || 0)
      }
      return total
    }, 0)
  }

  const totalRecibido = useMemo(() =>
    owners.reduce((sum, o) => sum + (o.totalabonado || 0), 0),
    [owners]
  )

  const totalPendiente = useMemo(() => {
    if (!registroActual) return 0
    const balanceAcumulado = calcularMontoDebidoHastaMes(searchMonth)
    return totalRecibido - balanceAcumulado
  }, [registroActual, totalRecibido, searchMonth])

  return (
    <div className="view active">
      <h1 style={{ fontWeight: 'bold', marginBottom: '25px' }}>Santos 1 | Contabilidad</h1>
      <div className="d-flex align-items-center mb-4" style={{ gap: '15px' }}>
        <input
          type="text"
          className="search-box"
          placeholder="Buscar mes (ej: julio-2024, agosto-2024)"
          style={{ maxWidth: '600px' }}
          value={searchMonth}
          onChange={(e) => setSearchMonth(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontWeight: 'bold' }}
            onClick={handleOpenInforme}
            disabled={!registroActual}
          >
            <i className="fas fa-file-alt" style={{ marginRight: '5px' }}></i>
            Informe
          </button>
          <button
            className="btn btn-success"
            style={{ padding: '10px 20px', fontWeight: 'bold' }}
            onClick={handleOpenModal}
          >
            <i className="fas fa-money-bill" style={{ marginRight: '5px' }}></i>
            Registros Financieros
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-lg-8">
          <h5 style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Información de Propietarios</h5>
        </div>
        <div className="col-lg-4">
          <h5 style={{ fontWeight: 'bold', margin: '0', marginBottom: '-5px' }}>Consulta de Cuotas</h5>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-lg-8">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h6 style={{ margin: 0, fontWeight: 600 }}>Condición:</h6>
            <button className="btn btn-outline-success" style={{ borderRadius: '20px', padding: '5px 15px', fontSize: '13px' }}>
              <i className="fas fa-circle" style={{ fontSize: '8px', marginRight: '5px' }}></i>
              Normal
            </button>
            <button className="btn btn-outline-danger" style={{ borderRadius: '20px', padding: '5px 15px', fontSize: '13px' }}>
              <i className="fas fa-circle" style={{ fontSize: '8px', marginRight: '5px' }}></i>
              Retraso
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="data-table">
            <table className="table table-hover mb-0" style={{ fontSize: '12px' }}>
              <thead>
                <tr style={{ padding: 0 }}>
                  <th style={{ padding: '8px 10px', fontSize: '14px', fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: '8px 10px', fontSize: '14px', fontWeight: 700 }}>Apto</th>
                  <th style={{ padding: '8px 10px', fontSize: '14px', fontWeight: 700 }}>Nombre del Propietario</th>
                  <th className="text-end" style={{ padding: '8px 10px', fontSize: '14px', fontWeight: 700 }}>
                    Total Recibido a la Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner, idx) => (
                  <tr
                    key={owner.idpropietario || idx}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: owner.estado === 'Verde' ? '#28a745' : '#dc3545',
                        }}
                      >
                        {owner.estado}
                      </span>
                    </td>
                    <td>{owner.numApto}</td>
                    <td>{owner.nombrePropietario}</td>
                    <td className="text-end">DOP$ {owner.totalabonado?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="detail-panel">
            <table className="table table-sm" style={{ fontSize: '11px' }}>
              <thead>
                <tr>
                  <th>Cuota Mensual</th>
                  <th>Descripción</th>
                  <th>Monto a Pagar</th>
                  <th className="text-end">Balance</th>
                </tr>
              </thead>
              <tbody>
                {registroActual && cuotasDetalle.length > 0 ? (
                  cuotasDetalle.map((detalle, idx) => (
                    <tr key={idx}>
                      <td>{detalle.cuotaMensual}</td>
                      <td>{detalle.descripcion}</td>
                      <td>DOP$ {detalle.montoPagar?.toFixed(2) || '0.00'}</td>
                      <td
                        className="text-end"
                        style={{
                          fontWeight: 'bold',
                          color: detalle.balance < 0 ? '#dc3545' : '#28a745'
                        }}
                      >
                        DOP$ {detalle.balance?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>
                      Busca un mes en el buscador
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Registros Financieros */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '25px', fontWeight: 'bold' }}>Registros Financieros</h3>

            <h5 style={{ marginBottom: '15px' }}>Todos los Registros</h5>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <table className="table table-hover">
                <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                  <tr>
                    <th>Mes Cuota</th>
                    <th>Cuota Mensual</th>
                    <th>Descripción</th>
                    <th className="text-end">Monto a Pagar</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.length > 0 ? (
                    registros.map((registro, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          setSearchMonth(registro.mesCuota)
                          handleCloseModal()
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{registro.mesCuota}</td>
                        <td>{registro.cuotaMensual}</td>
                        <td>{registro.descripcion}</td>
                        <td className="text-end">DOP$ {registro.montoPagar?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>
                        No hay registros financieros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                className="btn btn-secondary"
                onClick={handleCloseModal}
                style={{ padding: '10px 30px', fontWeight: 'bold' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informe */}
      {showInforme && registroActual && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseInforme}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              width: '95%',
              maxWidth: '1400px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Informe */}
            <div style={{
              background: '#364858',
              color: 'white',
              padding: '20px',
              borderRadius: '0px',
              marginBottom: '0px',
              textAlign: 'center'
            }}>
              <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '24px' }}>
                INFORME FINANCIERO DEL MES DE {searchMonth.split('-')[0].toUpperCase()}-{searchMonth.split('-')[1].toUpperCase()}
              </h2>
            </div>

            {/* Resumen Financiero */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0px',
              marginBottom: '0px',
              borderBottom: '3px solid #364858'
            }}>
              <div style={{
                padding: '20px',
                background: 'white',
                textAlign: 'center',
                borderRight: '1px solid #ddd'
              }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>Total Recibido:</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  DOP$ {cuotasDetalle
                    .filter(d => d.balance >= 0)
                    .reduce((sum, d) => sum + (d.montoPagar || 0), 0)
                    .toFixed(2)}
                </div>
              </div>
              <div style={{
                padding: '20px',
                background: 'white',
                textAlign: 'center',
                borderRight: '1px solid #ddd'
              }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>Monto Cuota Mensual:</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>DOP$ {registroActual.montoPagar?.toFixed(2) || '0.00'}</div>
              </div>
              <div style={{
                padding: '20px',
                background: 'white',
                textAlign: 'center',
                borderRight: '1px solid #ddd'
              }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>Monto a Pagar Total:</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>DOP$ {registroActual.montoPagar?.toFixed(2) || '0.00'}</div>
              </div>
              <div style={{
                padding: '20px',
                background: '#ffebee',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>Balance total Pendiente:</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#dc3545'
                }}>
                  DOP$ -{cuotasDetalle
                    .filter(d => d.balance < 0)
                    .reduce((sum, d) => sum + (d.montoPagar || 0), 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>

            {/* Tabla de Propietarios */}
            <div style={{ marginBottom: '0px' }}>
              <table className="table" style={{ marginBottom: '0px', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#364858', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>Apto</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>Propietario</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Total Recibido a la Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Cuota Mensual</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>Descripción</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Monto a Pagar</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotasDetalle.map((detalle, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px', fontSize: '12px' }}>{detalle.numApto}</td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>{detalle.nombrePropietario}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span
                                style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',       // Espacio interno para que no quede apretado
                                    borderRadius: '20px',      // Bordes redondeados tipo "píldora"
                                    color: '#ffffff',          // Texto blanco para contraste
                                    fontSize: '12px',          // Letra un poco más pequeña
                                    fontWeight: 'bold',        // Texto en negrita
                                    backgroundColor: detalle.balance >= 0 ? '#28a745' : '#dc3545' // Mismo color de fondo
                                }}
                            >
                            {/* Lógica para cambiar el texto */}
                            {detalle.balance >= 0 ? 'Al día' : 'Pendiente'}
                        </span>
                        </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>DOP$ {detalle.totalabonado?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>DOP$ {detalle.montoPagar?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>{detalle.descripcion}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>DOP$ {detalle.montoPagar?.toFixed(2) || '0.00'}</td>
                      <td
                        style={{
                          padding: '12px',
                          textAlign: 'right',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: detalle.balance < 0 ? '#dc3545' : '#28a745'
                        }}
                      >
                        DOP$ {detalle.balance?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sección de recibos */}
            <div style={{
              background: '#364858',
              color: 'white',
              padding: '15px',
              marginTop: '30px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              RECIBOS DE PAGOS ADJUNTOS
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#666',
              padding: '20px',
              borderTop: '2px solid #364858'
            }}>
              Generado el {new Date().toLocaleDateString('es-DO')} | Residencial Santos I
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={handleCloseInforme}
                style={{ padding: '10px 30px', fontWeight: 'bold' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VistaContabilidad
