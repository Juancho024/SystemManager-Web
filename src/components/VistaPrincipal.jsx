import { useMemo, useState } from 'react'

function VistaPrincipal({ owners }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOwners = useMemo(() => {
    if (!searchTerm.trim()) return owners
    const search = searchTerm.toLowerCase()
    return owners.filter(owner => 
      owner.nombrePropietario?.toLowerCase().includes(search) ||
      owner.numApto?.toLowerCase().includes(search) ||
      owner.totalabonado?.toFixed(2).includes(search)
    )
  }, [owners, searchTerm])

  const totalAbonado = useMemo(
    () =>
      filteredOwners.reduce((sum, owner) => sum + (owner.totalabonado || 0), 0),
    [filteredOwners]
  )

  const totalAdeudado = useMemo(
    () => filteredOwners.reduce((sum, owner) => sum + Math.abs(owner.balance || 0), 0),
    [filteredOwners]
  )

  const handleRowClick = (owner) => {
    console.log('Owner clicked:', owner)
  }

  return (
    <div className="view active">
      <h1 style={{ fontWeight: 'bold', marginBottom: '25px' }}>Santos 1 | Manager</h1>
      <input 
        type="text" 
        className="search-box mb-4" 
        placeholder="Buscar por nombre, apartamento o monto" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
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
        <div className="col-lg-8">
          <div className="data-table">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Apartamento</th>
                  <th>Nombre del Propietario</th>
                  <th className="text-end">Total Abonado</th>
                  <th className="text-end">Total Adeudado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner, idx) => (
                  <tr key={owner.idpropietario || idx} onClick={() => handleRowClick(owner)} style={{ cursor: 'pointer' }}>
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
        <div className="col-lg-4">
          <div className="total-card green">
            <h5>Total Abonado</h5>
            <h2 className="text-success">DOP$ {totalAbonado.toFixed(2)}</h2>
          </div>
          <div className="total-card red">
            <h5>Total Adeudado</h5>
            <h2 className="text-danger">DOP$ -{(totalAdeudado.toFixed(2) || 0)}</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VistaPrincipal
