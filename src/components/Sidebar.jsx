function Sidebar({ onShowView, currentView }) {
  const menuItems = [
    { id: 'principal', icon: 'fa fa-home', label: 'Principal' },
    { id: 'propietarios', icon: 'far fa-user', label: 'Propietarios' },
    { id: 'contabilidad', icon: 'fas fa-calculator', label: 'Contabilidad' },
    { id: 'calendario', icon: 'fas fa-calendar', label: 'Calendario' },
  ]

  return (
    <div className="sidebar">
      <div className="user-section">
        <div className="user-icon">
          <i className="far fa-user" style={{ fontSize: '50px', color: '#364858' }}></i>
        </div>
        <h6 style={{ color: 'white' }}>Bienvenido a</h6>
        <h4 style={{ color: 'white', fontWeight: 'bold' }}>System Manager</h4>
      </div>
      <nav>
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onShowView(item.id)}
            style={{ cursor: 'pointer' }}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
