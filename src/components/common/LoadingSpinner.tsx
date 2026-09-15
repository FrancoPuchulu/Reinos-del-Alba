import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-2',
}

export function LoadingSpinner({ size = 'md', label, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <motion.div
        className={`${SIZE_CLASSES[size]} border-[#2a1e14] border-t-[#c89b3c] rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {label && (
        <p className="text-[#7a5c22] text-[10px] font-body tracking-wider uppercase">{label}</p>
      )}
    </div>
  )
}
