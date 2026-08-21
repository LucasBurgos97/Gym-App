import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40 }}>
          <h2>Ocurrió un error inesperado</h2>
          <p className="muted">{this.state.error.message}</p>
          <button className="btn" onClick={() => this.setState({ error: null })}>
            Volver a intentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
