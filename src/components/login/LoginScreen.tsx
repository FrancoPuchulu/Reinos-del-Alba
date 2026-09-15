import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicInput } from '@/components/common/GothicInput'
import { GothicPanel } from '@/components/common/GothicPanel'
import { dispatch } from '@/store/GameStore'
import { GAME_CONFIG } from '@/config/game'

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

interface FormErrors {
  username?: string
  password?: string
  email?: string
  confirm?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function LoginScreen() {
  const usernameRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showRegister, setShowRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!formData.username.trim()) e.username = 'El usuario es requerido'
    if (!formData.password.trim()) e.password = 'La contrasena es requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = () => {
    if (!validate()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      dispatch({ type: 'SET_SCREEN', payload: 'creation' })
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center gothic-bg"
      onKeyDown={handleKeyDown}
    >
      <div className="relative z-10 w-full max-w-sm px-4">
        <AnimatePresence mode="wait">
          {!showRegister && !showForgotPassword ? (
            <motion.div
              key="login"
              {...PAGE_VARIANTS}
              transition={{ duration: 0.3 }}
            >
              <div className="relative bg-black/75 border-double border-4 border-[var(--wow-border)] p-6 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_12px_rgba(192,168,96,0.08)]">
                {/* Ornamental corners */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[var(--wow-border-gold-bright)]" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[var(--wow-border-gold-bright)]" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[var(--wow-border-gold-bright)]" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[var(--wow-border-gold-bright)]" />

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mb-6 text-center"
                >
                  <div className="mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[var(--wow-border)] bg-[var(--gothic-nature-dark)] flex items-center justify-center">
                      <span className="text-[var(--wow-border)] text-lg">&#9876;</span>
                    </div>
                  </div>
                  <h1
                    className="text-2xl font-[var(--font-pixel)] text-[var(--gothic-text)] tracking-wider uppercase"
                    style={{ textShadow: '2px 2px 0 #0a0a0a, 0 0 20px rgba(192,168,96,0.15)' }}
                  >
                    {GAME_CONFIG.TITLE}
                  </h1>
                  <p className="text-[9px] text-[var(--wow-border)] font-[var(--font-pixel)] tracking-wider uppercase mt-2">
                    {GAME_CONFIG.SUBTITLE}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-4">
                    <GothicInput
                      ref={usernameRef}
                      label="USUARIO"
                      value={formData.username}
                      onChange={(v) => setFormData((p) => ({ ...p, username: v }))}
                      placeholder="Tu nombre..."
                      error={errors.username}
                      required
                    />
                    <GothicInput
                      label="CONTRASENA"
                      type="password"
                      value={formData.password}
                      onChange={(v) => setFormData((p) => ({ ...p, password: v }))}
                      placeholder="********"
                      error={errors.password}
                      required
                    />
                  </div>

                  <div className="mt-5 space-y-2">
                    <motion.div
                      whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(192,168,96,0.35)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                    >
                      <GothicButton
                        onClick={handleLogin}
                        fullWidth
                        disabled={isLoading}
                        size="lg"
                        variant="gold"
                      >
                        {isLoading ? 'CARGANDO...' : 'INICIAR SESION'}
                      </GothicButton>
                    </motion.div>

                    <div className="flex gap-2 justify-center">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="flex-1"
                      >
                        <GothicButton
                          onClick={() => setShowRegister(true)}
                          variant="secondary"
                          fullWidth
                          size="sm"
                        >
                          CREAR CUENTA
                        </GothicButton>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="flex-1"
                      >
                        <GothicButton
                          onClick={() => setShowForgotPassword(true)}
                          variant="ghost"
                          fullWidth
                          size="sm"
                        >
                          OLVIDE CONTRASENA
                        </GothicButton>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-[var(--wow-border)] text-[9px] font-[var(--font-pixel)] tracking-wider mt-4 opacity-60"
              >
                VERSION {GAME_CONFIG.VERSION}
              </motion.p>
            </motion.div>
          ) : showRegister ? (
            <RegisterForm key="register" onBack={() => setShowRegister(false)} />
          ) : (
            <ForgotPasswordForm key="forgot" onBack={() => setShowForgotPassword(false)} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function RegisterForm({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!data.username.trim()) e.username = 'El nombre de usuario es requerido'
    else if (data.username.length < 3) e.username = 'Minimo 3 caracteres'
    if (!data.email.trim()) e.email = 'El email es requerido'
    else if (!validateEmail(data.email)) e.email = 'Email invalido'
    if (!data.password.trim()) e.password = 'La contrasena es requerida'
    else if (data.password.length < 6) e.password = 'Minimo 6 caracteres'
    if (data.password !== data.confirm) e.confirm = 'Las contrasenas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onBack()
    }, 1500)
  }

  return (
    <motion.div key="register" {...PAGE_VARIANTS}>
      <GothicPanel title="CREAR CUENTA" variant="ornate">
        <div className="space-y-3">
          <GothicInput
            label="USUARIO"
            value={data.username}
            onChange={(v) => setData((p) => ({ ...p, username: v }))}
            error={errors.username}
            placeholder="Tu nombre..."
            required
          />
          <GothicInput
            label="EMAIL"
            type="email"
            value={data.email}
            onChange={(v) => setData((p) => ({ ...p, email: v }))}
            error={errors.email}
            placeholder="correo@ejemplo.com"
            required
          />
          <GothicInput
            label="CONTRASENA"
            type="password"
            value={data.password}
            onChange={(v) => setData((p) => ({ ...p, password: v }))}
            error={errors.password}
            placeholder="********"
            required
          />
          <GothicInput
            label="CONFIRMAR CONTRASENA"
            type="password"
            value={data.confirm}
            onChange={(v) => setData((p) => ({ ...p, confirm: v }))}
            error={errors.confirm}
            placeholder="********"
            required
          />
        </div>
        <div className="mt-5 space-y-2">
          <GothicButton onClick={handleSubmit} fullWidth size="lg" variant="gold" disabled={isLoading}>
            {isLoading ? 'CREANDO...' : 'CREAR CUENTA'}
          </GothicButton>
          <GothicButton onClick={onBack} variant="ghost" fullWidth size="sm">
            ← VOLVER
          </GothicButton>
        </div>
      </GothicPanel>
    </motion.div>
  )
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = () => {
    if (!email.trim()) { setError('Ingresa tu email'); return }
    if (!validateEmail(email)) { setError('Email invalido'); return }
    setError('')
    setSent(true)
  }

  return (
    <motion.div key="forgot" {...PAGE_VARIANTS}>
      <GothicPanel title="RECUPERAR CONTRASENA" variant="ornate">
        {!sent ? (
          <>
            <p className="text-[#a0a090] text-xs text-center mb-3">
              Ingresa tu email y recibiras instrucciones para recuperar tu cuenta.
            </p>
            <GothicInput
              label="EMAIL"
              type="email"
              value={email}
              onChange={(v) => { setError(''); setEmail(v) }}
              placeholder="correo@ejemplo.com"
              error={error}
              required
            />
            <div className="mt-5 space-y-2">
              <GothicButton onClick={handleSend} fullWidth size="md" variant="gold">
                ENVIAR INSTRUCCIONES
              </GothicButton>
              <GothicButton onClick={onBack} variant="ghost" fullWidth size="sm">
                ← VOLVER
              </GothicButton>
            </div>
          </>
        ) : (
          <>
            <p className="text-[var(--gothic-nature-light)] text-xs text-center">
              Las instrucciones han sido enviadas. Revisa tu correo.
            </p>
            <div className="mt-5">
              <GothicButton onClick={onBack} fullWidth size="md">
                VOLVER
              </GothicButton>
            </div>
          </>
        )}
      </GothicPanel>
    </motion.div>
  )
}
