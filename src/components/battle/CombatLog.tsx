interface CombatLogProps {
  combatLog: string[]
}

export function CombatLog({ combatLog }: CombatLogProps) {
  const visible = combatLog.slice(-4)

  return (
    <div
      className="flex-1 border-b sm:border-b-0 sm:border-r-2 border-[var(--gothic-nature)] overflow-y-auto wow-scroll flex flex-col justify-end"
      role="status"
      aria-live="polite"
      aria-label="Registro de combate"
    >
      <div className="p-3 space-y-1">
        {visible.map((log: string, idx: number) => (
          <p key={idx} className={`text-[11px] font-mono leading-tight ${
            idx === visible.length - 1
              ? 'text-[var(--gothic-text)] font-semibold'
              : 'text-[#6a8a3a]'
          }`}>
            {log}
          </p>
        ))}
      </div>
    </div>
  )
}
