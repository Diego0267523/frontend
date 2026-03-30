import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el siguiente renderizado muestre la UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error ? this.state.error.toString() : "Error desconocido";
      const errorStack = this.state.errorInfo?.componentStack || "Sin stack trace disponible";

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#000',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>
            🚨 ¡Ups! Algo salió mal
          </h1>
          <p style={{ marginBottom: '20px', color: '#ccc' }}>
            Ha ocurrido un error inesperado en la aplicación.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Recargar página
          </button>

          <details style={{ marginTop: '20px', textAlign: 'left', color: '#ddd', width: '90%', maxWidth: '900px' }}>
            <summary style={{ cursor: 'pointer', color: '#00ff88', fontWeight: 700 }}>
              Detalles del error (para depuración)
            </summary>
            <pre style={{
              backgroundColor: '#111',
              padding: '10px',
              borderRadius: '5px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '10px',
              whiteSpace: 'pre-wrap'
            }}>
              {errorMessage}
              {'\n'}
              {errorStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;