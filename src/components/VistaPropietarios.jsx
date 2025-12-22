import { useState, useMemo } from 'react'

function VistaPropietarios({ owners, selectedOwner, onSelectOwner }) {
  const [showModal, setShowModal] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const apiBase = import.meta.env.VITE_API_BASE

  const filteredOwners = useMemo(() => {
    if (!searchTerm.trim()) return owners
    const search = searchTerm.toLowerCase()
    return owners.filter(owner => 
      owner.nombrePropietario?.toLowerCase().includes(search) ||
      owner.numApto?.toLowerCase().includes(search) ||
      owner.totalabonado?.toFixed(2).includes(search)
    )
  }, [owners, searchTerm])

  const handleRowClick = (owner) => {
    onSelectOwner(owner)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setNewAmount('')
  }

  const handleConfirm = async () => {
    if (!newAmount || isNaN(newAmount) || parseFloat(newAmount) <= 0) {
      alert('Ingresa un monto válido mayor a 0')
      return
    }

    const nuevoTotal = (selectedOwner.totalabonado || 0) + parseFloat(newAmount)

    try {
      const response = await fetch(`${apiBase}/api/propietarios/${selectedOwner.idpropietario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalabonado: nuevoTotal })
      })

      if (response.ok) {
        alert('Abonado actualizado correctamente')
        handleCloseModal()
        window.location.reload() // Recarga para ver cambios
      } else {
        alert('Error al actualizar')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    }
  }

  return (
    <div className="view active">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          className="search-box"
          placeholder="Buscar por nombre, apartamento o monto"
          style={{ maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="d-flex align-items-center mb-4">
        <h5 style={{ margin: 0, marginRight: '15px' }}>Condición:</h5>
        <button className="btn btn-outline-success" style={{ borderRadius: '20px', marginRight: '10px' }}>
          <i className="fas fa-circle" style={{ fontSize: '10px' }}></i> Normal
        </button>
        <button className="btn btn-outline-danger" style={{ borderRadius: '20px' }}>
          <i className="fas fa-circle" style={{ fontSize: '10px' }}></i> Retraso
        </button>
      </div>
      <div className="row">
        <div className="col-lg-7">
          <div className="data-table">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Numero de Apto</th>
                  <th>Nombre del Propietario</th>
                  <th className="text-end">Total Abonado</th>
                  <th className="text-end">Total Adeudado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner, idx) => (
                  <tr
                    key={owner.idpropietario || idx}
                    onClick={() => handleRowClick(owner)}
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
                    <td className="text-end">
                      <span
                        style={{
                          color: owner.balance < 0 ? '#dc3545' : '#28a745',
                          fontWeight: 'bold',
                        }}
                      >
                        DOP$ {(owner.balance || 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="detail-panel">
            <h3>Detalles del Propietario</h3>
            {selectedOwner ? (
              <>
                <label>Numero de Apartamento:</label>
                <input type="text" value={selectedOwner.numApto || ''} readOnly />
                <label>Nombre del Propietario:</label>
                <input type="text" value={selectedOwner.nombrePropietario || ''} readOnly />
                <label>Total Abonado a la Fecha:</label>
                <input type="text" value={`DOP$ ${(selectedOwner.totalabonado || 0).toFixed(2)}`} readOnly />
                <label>Total Adeudado a la Fecha:</label>
                <input
                  type="text"
                  value={`DOP$ ${(selectedOwner.balance || 0).toFixed(2)}`}
                  readOnly
                />
                <div className="d-flex gap-3 mt-4">
                  <button 
                    className="btn btn-success flex-fill" 
                    style={{ padding: '12px', fontWeight: 'bold' }}
                  >Modificar Abonado</button>
                </div>
              </>
            ) : (
              <p style={{ color: '#999' }}>Selecciona un propietario para ver detalles</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal para modificar abonado */}
      {showModal && selectedOwner && (
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
              maxWidth: '500px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '25px', fontWeight: 'bold' }}>Modificar Abonado</h3>
            
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Apartamento:
            </label>
            <input 
              type="text" 
              value={selectedOwner.numApto || ''} 
              readOnly
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '20px',
                backgroundColor: '#f5f5f5'
              }}
            />

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Propietario:
            </label>
            <input 
              type="text" 
              value={selectedOwner.nombrePropietario || ''} 
              readOnly
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '20px',
                backgroundColor: '#f5f5f5'
              }}
            />

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Total Abonado Actual:
            </label>
            <input 
              type="text" 
              value={`DOP$ ${(selectedOwner.totalabonado || 0).toFixed(2)}`}
              readOnly
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '20px',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
                color: '#28a745'
              }}
            />

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Monto a Agregar:
            </label>
            <input 
              type="number" 
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #28a745',
                borderRadius: '5px',
                marginBottom: '20px',
                fontSize: '16px'
              }}
            />

            {newAmount && !isNaN(newAmount) && parseFloat(newAmount) > 0 && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#d4edda', 
                borderRadius: '5px',
                marginBottom: '20px',
                border: '1px solid #c3e6cb'
              }}>
                <strong>Nuevo Total:</strong> DOP$ {((selectedOwner.totalabonado || 0) + parseFloat(newAmount)).toFixed(2)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '12px', fontWeight: 'bold' }}
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-success" 
                style={{ flex: 1, padding: '12px', fontWeight: 'bold' }}
                onClick={handleConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VistaPropietarios
