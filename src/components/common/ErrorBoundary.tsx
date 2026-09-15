import { Component, type ReactNode, type ErrorInfo } from 'react'
import { GothicPanel } from './GothicPanel'
import { GothicButton } from './GothicButton'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <GothicPanel variant="ornate" className="max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <span className="text-[#a01818] text-4xl font-display block mb-2">⚠</span>
              <h2 className="text-[#c89b3c] text-lg font-display tracking-wider uppercase">
                Error Crítico
              </h2>
              <p className="text-[#a0907a] text-xs font-body mt-2 leading-relaxed">
                El pacto se ha roto. Un error inesperado ha corrompido el tejido de la realidad.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-[#6b1515] text-[10px] font-body mb-4 p-2 bg-black/50 rounded max-h-24 overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-2">
              <GothicButton onClick={this.handleReset} variant="gold" fullWidth>
                Reintentar
              </GothicButton>
              <GothicButton onClick={this.handleReload} variant="secondary" fullWidth>
                Recargar Portal
              </GothicButton>
            </div>
            <p className="text-[#4a3a18] text-[9px] font-body mt-3">
              Si el error persiste, contacta con los ancianos.
            </p>
          </GothicPanel>
        </div>
      )
    }

    return this.props.children
  }
}
