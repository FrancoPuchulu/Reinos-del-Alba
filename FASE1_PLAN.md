# FASE 1 — Plan de Ejecución: Solidez Técnica

> **Proyecto:** Reinos del Alba (React 18 + TypeScript + Vite + Tailwind + Vitest)
> **Objetivo:** Tests de integración para módulos sin cobertura + Migración del store custom a Zustand.
> **Restricción:** NO se modifica gameplay, balance, ni comportamiento visible del usuario.
> **Verificación:** Al finalizar, `tsc -b` 0 errores, `vitest run` ≥89 tests pasan, `eslint src/` 0 errores.

---

## PARTE A — Tests de Integración (módulos sin cobertura)

**Objetivo:** Cubrir con tests los módulos que hoy tienen 0 tests y riesgo alto/medio.

### A1. Archivos de test a crear

Cada archivo se ubica en `src/<carpeta>/__tests__/` siguiendo la convención existente (ver `src/engine/__tests__/`, `src/store/__tests__/`).

#### A1.1 `src/game/__tests__/enginebridge.test.ts` (Prioridad ALTA — riesgo más alto sin tests)

Qué testear:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EngineBridge } from '../enginebridge'
```

**Tests obligatorios:**

1. `startNewBattle()` crea estado con allies/enemies correctos
   - Verificar que `result.engineState.allies` tiene 1 miembro
   - Verificar que `result.engineState.enemies` tiene 1 miembro
   - Verificar que `result.uiState.player.name` coincide con input
   - Verificar que `result.uiState.enemy.name` coincide con input
   - Verificar que hp iniciales = maxHp para ambos

2. `startNewBattle()` con habilidad definitiva
   - Pasar `ultSkill` con `isUltimate: true`
   - Verificar que `result.engineState.ultimateSkill` no es null

3. `selectAction()` ejecuta un ataque básico
   - Crear battle con `startNewBattle`
   - Ejecutar `selectAction(engine, ui, 0)` (primera habilidad)
   - Verificar que `result.engineState.turn` incrementó
   - Verificar que el log tiene al menos 1 entrada

4. `selectAction()` daño es razonable
   - Verificar que `result.uiState.enemy.currentHp` ≤ `result.uiState.enemy.maxHp`
   - Verificar que `result.uiState.enemy.currentHp` ≥ 1 (mínimo)

5. `consumeItem()` usa una poción
   - Crear battle
   - Ejecutar `consumeItem(engine, ui, 'health')`
   - Verificar que el inventario de pociones disminuyó

6. `selectAction()` triggers de eventos
   - Mock `gameEventBus.emit`
   - Ejecutar selectAction
   - Verificar que se emitió al menos un evento

**Nota:** El EngineBridge importa `gameEventBus` y usa `structuredClone`. Mockear solo lo necesario.

---

#### A1.2 `src/game/__tests__/loot.test.ts` (Prioridad MEDIA)

```typescript
import { describe, it, expect } from 'vitest'
import { generateLoot } from '../loot'
```

**Tests obligatorios:**

1. `generateLoot(1)` retorna un InventoryItem válido
   - Verificar que tiene `id`, `name`, `rarity`, `stats`, `slot`, `source: 'botin'`

2. `generateLoot(1)` produce items de rarity válida
   - Ejecutar 100 veces, verificar que todas las rarities son: 'normal', 'magico', 'epico', 'unico'

3. `generateLoot(level, 'Guerrero')` produce items para Guerrero
   - Verificar que `slot` es uno de los slots válidos ('armaPrincipal', 'armaSecundaria', 'armadura', etc.)

4. `generateLoot(level)` acepta nivel alto sin errors
   - Ejecutar `generateLoot(50)` — no debe throw

5. `generateLoot()` sin class funciona (fallback random)
   - Ejecutar sin segundo argumento — no debe throw

---

#### A1.3 `src/engine/__tests__/expeditions.test.ts` (Prioridad MEDIA)

```typescript
import { describe, it, expect } from 'vitest'
import { calculateRewards, isExpeditionComplete, rollRarity } from '../expeditions'
```

**Tests obligatorios:**

1. `isExpeditionComplete()` retorna false si tiempo no completado
   - Crear expedición con time 300, elapsed 100 → false

2. `isExpeditionComplete()` retorna true si tiempo completado
   - Crear expedición con time 300, elapsed 300 → true

3. `calculateRewards()` produce recompensas positivas
   - Para nivel 1, normal → gold > 0, xp > 0

4. `calculateRewards()` dificultad heroico da más
   - Normal < heroico < mitico para mismo nivel

5. `rollRarity()` retorna rarity válida
   - Ejecutar 50 veces, verificar que el resultado es 'normal', 'magico', 'epico' o 'unico'

---

#### A1.4 `src/store/__tests__/persistence.test.ts` (Prioridad MEDIA)

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
```

**Tests obligatorios:**

1. `isValidCharacter()` acepta personaje válido
   - Objeto con todos los campos requeridos → true

2. `isValidCharacter()` rechaza sin nombre → false

3. `isValidCharacter()` rechaza level < 1 → false

4. `isValidCharacter()` rechaza sin class → false

5. `isValidCharacter()` rechaza sin race → false

6. `isValidCharacter()` rechaza sin wallet → false

7. `isValidCharacter()` rechaza no-object → false

8. `isValidCharacter()` acepta con arenaRank opcional → true

---

#### A1.5 `src/events/__tests__/EventBus.test.ts` (Prioridad BAJA)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { gameEventBus } from '../EventBus'
```

**Tests obligatorios:**

1. `subscribe` + `emit` ejecuta el listener

2. `subscribe` retorna unsubscribe que funciona

3. `emit` sin listeners no lanza error

4. Wildcard `*` recibe todos los eventos

---

### A2. Ejecución y verificación

```powershell
npx vitest run
# Esperado: ≥89 tests pasan (tests existentes + nuevos)
# Los tests existentes NO deben fallar
```

**Si algún test nuevo falla:**
- NO modificar el código del módulo para que pase
- Revisar si el test tiene un asumpción incorrecta
- Si el test refleja comportamiento real, ajustar el test
- Si el test expone un bug real, documentarlo pero NO arreglarlo (eso es Fase 2)

---

## PARTE B — Migración GameStore → Zustand

### B0. Preparación

```bash
npm install zustand
```

No se instalan más dependencias.

### B1. Arquitectura actual vs objetivo

**ACTUAL (custom store manual):**
```
_state (mutable global) ← reducer() ← dispatch(action)
_listeners (Set<listener>) ← subscribe() / notify
GameProvider (React Context) ← useState + useEffect(subscribe)
GameContext.Provider value={state} ← re-render en cada cambio
useGameStore() ← useContext(GameContext)
```

**OBJETIVO (Zustand):**
```
useGameStore = create<GameState>()(persist(reducer))
dispatch = useGameStore.getState().dispatch (referencia estable)
getState = useGameStore.getState (sin dispatch)
resetStore = useGameStore.setState(initialState, true)
No hay GameProvider/Context — Zustand reemplaza el Provider
```

**Lo que NO cambia:**
- El tipo `GameState` se mantiene idéntico
- El tipo `GameAction` se mantiene idéntico
- La lógica del `reducer()` se mantiene idéntica (copy-paste)
- Las exportaciones públicas: `useGameStore`, `dispatch`, `getState`, `resetStore`, `GameProvider` (como wrapper vacío o eliminado)
- `AUTOSAVE_ACTIONS` se mantiene
- `calculateElo` se mantiene

### B2. Nuevo GameStore.tsx — Estructura

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
// ... imports existentes (tipos, data, engine, etc.)

// ─── TYPES (sin cambios) ─────────────────────────────────────
export interface GameState { /* igual que antes */ }
export type GameAction = /* igual que antes */

// ─── STATE INICIAL ────────────────────────────────────────────
const initialState: GameState = {
  character: null,
  combat: null,
  screen: 'login',
  expedition: null,
  levelUpCount: 0,
}

// ─── REDUCER (sin cambios en la lógica) ───────────────────────
function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ... exactamente el mismo switch que ahora
  }
}

// ─── THROTTLED STORAGE (autosave cooldown 2s) ─────────────────
let saveTimer: ReturnType<typeof setTimeout> | null = null
const THROTTLED_STORAGE = {
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => localStorage.setItem(name, value), 2000)
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}

// ─── ZUSTAND STORE ────────────────────────────────────────────
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      dispatch: (action: GameAction) => {
        const next = reducer(get(), action)
        set(next, true)
      },
    }),
    {
      name: 'reinos-del-alba-save',
      partialize: (state) => ({
        character: state.character,
        expedition: state.expedition,
      }),
      storage: createJSONStorage(() => THROTTLED_STORAGE),
      skipHydration: false,
      merge: (persisted, current) => {
        const saved = persisted as Partial<GameState> | null
        return {
          ...initialState,
          ...current,
          ...(saved ?? {}),
          dispatch: current.dispatch, // siempre preservar dispatch
        }
      },
    }
  )
)

// ─── EXPORTS COMPATIBLES ──────────────────────────────────────
export function dispatch(action: GameAction): void {
  useGameStore.getState().dispatch(action)
}

export function getState(): GameState {
  const { dispatch: _, ...rest } = useGameStore.getState()
  return rest as GameState
}

export function resetStore(): void {
  useGameStore.setState({ ...initialState }, true)
}

// ELO (sin cambios)
export function calculateElo(...args: Parameters<typeof _calculateElo>): number {
  return _calculateElo(...args)
}
```

**Importante: `merge`** se usa porque `persist` por default hace shallow merge. Necesitamos `merge` para preservar `dispatch` después de rehidratar. Zustand persist v4+ recibe `(persisted, current)` en merge y retorna el merged state.

### B3. Eliminación del Context/Provider

**Archivo:** `App.tsx`

Cambiar:
```tsx
// ANTES
import { GameProvider } from '@/store/GameStore'
// ...
<GameProvider>
  <AppContent />
</GameProvider>
```

A:
```tsx
// DESPUÉS — GameProvider eliminado, contenido directo
<div className="w-screen h-screen overflow-hidden gothic-bg">
  <Suspense fallback={...}>
    {/* contenido directo, sin GameProvider wrapper */}
  </Suspense>
</div>
```

Si `GameProvider` se mantiene como export, puede ser un passthrough vacío:
```tsx
export function GameProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```
Esto evita romper imports en otros archivos. Se puede eliminar después.

### B4. Expedición Timer — Mover de GameProvider a App.tsx

**Problema:** El timer de expedición (`setInterval 1s`) está en `GameProvider`. Al eliminar GameProvider, este timer se pierde.

**Solución:** Mover el `useEffect` del timer a `App.tsx` (dentro de `AppContent`):

```tsx
useEffect(() => {
  if (!expedition || !character) return
  const interval = setInterval(() => {
    const exp = getState().expedition
    const char = getState().character
    if (!exp || !char) return
    if (!isExpeditionComplete(exp)) return
    if (exp.bonusBossReady) return
    const bossData = generateBonusBossForExpedition(exp)
    dispatch({ type: 'TRIGGER_BONUS_BOSS', payload: { expedition: exp, bossData } })
  }, 1000)
  return () => clearInterval(interval)
}, [expedition, character])
```

Los imports necesarios (`isExpeditionComplete`, `generateBonusBossForExpedition`) ya están en App.tsx.

### B5. Migración de tests existentes

**Archivo:** `src/store/__tests__/GameStore.test.ts`

Cambios mínimos necesarios:

1. **Import mock de persistence** — cambia el path del mock:
```typescript
// ANTES
vi.mock('../persistence', () => ({ ... }))

// DESPUÉS — el store ahora maneja persistence internamente
// El mock de persistence se mantiene porque dispatch() interno lo importa
vi.mock('../persistence', () => ({
  autosave: vi.fn(),
  loadGame: vi.fn().mockReturnValue(null),
  saveGame: vi.fn().mockReturnValue(true),
  deleteSave: vi.fn(),
  hasSavedGame: vi.fn().mockReturnValue(false),
}))
```

2. **Las llamadas `dispatch`, `getState`, `resetStore` se mantienen igual** — no hay cambios en tests existentes.

3. **Nuevo test para verificar que dispatch funciona:**
```typescript
it('dispatch updates state synchronously', () => {
  dispatch({ type: 'SET_SCREEN', payload: 'battle' })
  expect(getState().screen).toBe('battle')
})
```

### B6. Persistencia — Validación de save cargado

**Archivo:** `src/store/persistence.ts`

Mantener `isValidCharacter` como está. El store rehidrata con `merge`, y si el dato cargado es inválido (campos faltantes), el merge con `initialState` lo deja con `character: null` → pantalla de login.

Agregar validación post-rehidratar (opcional pero recomendado):
```typescript
// En GameStore.tsx, después de crear el store:
useGameStore.subscribe((state, prev) => {
  if (state.character && !isValidCharacter(state.character)) {
    useGameStore.setState({ character: null, screen: 'login' })
  }
})
```

### B7. Evento 'Victory' → autosave

**Actual:** En `GameProvider`, `gameEventBus.subscribe('Victory', () => autosave())`

**Nuevo:** En `GameStore.tsx` o `App.tsx`:
```typescript
useEffect(() => {
  const unsub = gameEventBus.subscribe('Victory', () => {
    // Forzar guardado inmediato al ganar
    const state = useGameStore.getState()
    const serialized = JSON.stringify({ character: state.character })
    localStorage.setItem('reinos-del-alba-save', serialized)
  })
  return unsub
}, [])
```

---

## PARTE C — Limpieza de imports y tipos

### C1. Imports rotos después de la migración

**Buscar con:**
```powershell
Select-String -Path "src\**\*.tsx","src\**\*.ts" -Pattern "useGameStore|dispatch|getState|resetStore|GameProvider|GameContext" | ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
```

**Tipos de import afectados:**
- `import { useGameStore, dispatch } from '@/store/GameStore'` → **sin cambios** (las exports se mantienen)
- `import { GameProvider } from '@/store/GameStore'` → puede eliminarse si GameProvider es passthrough
- `import { GameContext } from '@/store/GameStore'` → **eliminar** (ya no existe)

### C2. Archivos que importan GameContext directamente

Buscar:
```powershell
Select-String -Path "src\**\*.tsx" -Pattern "GameContext|useContext"
```

Estos archivos necesitan ser actualizados para usar `useGameStore()` en su lugar.

---

## PARTE D — CharacterCreationScreen (restaurar guard)

**Archivo:** `src/components/creation/CharacterCreationScreen.tsx:39`

Durante Fase 0 se eliminó `if (!match) return null` en `resolveStats`. Restaurarlo para robustez:

```typescript
function resolveStats(classId: string | null): Record<string, number> | null {
  if (!classId) return null
  const match = (BASE_STATS_CLASES as Record<string, typeof BASE_STATS_CLASES.Guerrero>)[classId]
  if (!match) return null
  const { hpMod: _h, mpMod: _m, damageType: _d, ...statBlock } = match
  return statBlock as Record<string, number>
}
```

Esto es consistente con el patrón `getUltimateForClass` de Fase 0.

---

## ORDEN DE EJECUCIÓN

1. **Instalar Zustand** (`npm install zustand`)
2. **Crear archivos de test** (Parte A) — verify `vitest run` pasa
3. **Migrar GameStore.tsx** (Parte B2) — rewrite interno
4. **Actualizar App.tsx** (Parte B3, B4) — quitar GameProvider, mover timer
5. **Migrar tests** (Parte B5) — adaptar mocks si es necesario
6. **Agregar validación post-rehidratación** (Parte B6)
7. **Mover victory autosave** (Parte B7)
8. **Restaurar guard CharacterCreation** (Parte D)
9. **Buscar imports rotos** (Parte C) — fix si existen
10. **Verificación final completa** (Parte E)

---

## VERIFICACIÓN FINAL

```powershell
# 1. TypeScript
npx tsc -b
# Esperado: 0 errores

# 2. Tests
npx vitest run
# Esperado: todos pasan (89 existentes + nuevos)

# 3. ESLint
npx eslint src/
# Esperado: 0 errores, ≤5 warnings nuevos (por imports zustand o dispatch)

# 4. Build
npm run build
# Esperado: build exitoso

# 5. Smoke test manual
npx vite
# Abrir http://localhost:5173
# Crear personaje → Equipar item → Ir a battle → Ganar → Verificar que save persiste (refrescar)
```

---

## ARCHIVOS QUE SE MODIFICAN

| Archivo | Cambio |
|---------|--------|
| `package.json` | +zustand dependency |
| `src/store/GameStore.tsx` | Rewrite interno: Zustand + persist + throttled storage |
| `src/App.tsx` | Eliminar GameProvider wrapper, mover expedition timer |
| `src/components/creation/CharacterCreationScreen.tsx` | Restaurar guard `!match` (Parte D) |
| `src/store/__tests__/GameStore.test.ts` | Adaptar si es necesario |
| `src/game/__tests__/enginebridge.test.ts` | **NUEVO** |
| `src/game/__tests__/loot.test.ts` | **NUEVO** |
| `src/engine/__tests__/expeditions.test.ts` | **NUEVO** |
| `src/store/__tests__/persistence.test.ts` | **NUEVO** |
| `src/events/__tests__/EventBus.test.ts` | **NUEVO** |

## ARCHIVOS QUE NO SE TOCAN

- `src/engine/combat.ts` (motor)
- `src/data/gameData.ts` (balance)
- `src/data/items/*.ts` (items)
- `src/game/config.ts` (balance de clases)
- `src/game/combat-config.ts` (constantes)
- `src/components/battle/CombatHeader.tsx`
- `src/components/combat/CombatScreen.tsx`
- `src/components/combat/AbilityBar.tsx`
- `src/components/battle/VictoryModal.tsx`
- Cualquier componente de UI que no importe GameContext directamente

---

*Plan generado el 2026-09-15. Ejecutar en orden secuencial sin desviaciones.*
