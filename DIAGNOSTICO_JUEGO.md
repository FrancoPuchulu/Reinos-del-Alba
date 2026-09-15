# DIAGNOSTICO_JUEGO.md — Auditoría Exhaustiva de Salud del Juego

> **Proyecto:** Reinos del Alba  
> **Fecha:** 2026-07-26  
> **Versión:** 1.0.0  
> **Auditor:** opencode (Senior Code Auditor / Lead Developer)  
> **Stack:** React 19 + TypeScript 5.6 + Vite 5.4 + Tailwind 4 + Framer Motion 12 + Vitest 4.1

---

## 0. VERIFICACIÓN ESTÁTICA

### TypeScript (`npx tsc -b`)
```
Exit code: 0 — 0 errores de tipo
```

### Tests (`npx vitest run`)
```
Test Files  7 passed (7)
Tests       89 passed (89)
Exit code: 0
```

### ESLint (`npx eslint src/`)
```
34 problems (16 errors, 18 warnings)
Exit code: 1
```

#### Errores activos (16):

| # | Archivo | Línea | Error | Severidad |
|---|---------|-------|-------|-----------|
| 1 | `App.tsx` | 61 | `react-hooks/set-state-in-effect` — setState síncrono dentro de useEffect | **error** |
| 2 | `CombatHeader.tsx` | 143-144 | `consistent-type-imports` — `import()` type annotations prohibidas | **error** |
| 3 | `CombatScreen.tsx` | 6 | `no-unused-vars` — `Skill` importado no usado | **error** |
| 4 | `CombatScreen.tsx` | 14 | `no-unused-vars` — `UltimateChargeBar` importado no usado | **error** |
| 5 | `CombatScreen.tsx` | 43 | `no-unused-vars` — `turnCountRef` asignado no usado | **error** |
| 6 | `UltimateChargeBar.tsx` | 17 | `no-unused-vars` — parámetro `side` no usado | **error** |
| 7 | `SkillBook.tsx` | 1 | `no-unused-vars` — `useState` importado no usado | **error** |
| 8 | `TalentsTab.tsx` | 8-9 | `no-unused-vars` — `calculateSkillDamage`, `calculateTotalStats` no usados | **error** |
| 9 | `shared.tsx` | 7 | `no-unused-vars` — `StatBlock` importado no usado | **error** |
| 10 | `shared.tsx` | 504 | `no-non-null-assertion` — `ultimateSkill!` forbiden non-null assertion | **error** |
| 11 | `enginebridge.ts` | 18,33 | `consistent-type-imports` — `import()` type annotations prohibidas | **error** |
| 12 | `GameStore.tsx` | 199 | `prefer-const` — `newInventory` nunca reasignado, debería ser `const` | **error** |
| 13 | `combat.ts` | 645 | `no-useless-assignment` — `enemySkill` asignado sin uso posterior | **error** |

#### Warnings activos (18):

| Archivo | Línea | Warning |
|---------|-------|---------|
| `App.tsx` | 45 | `no-unnecessary-condition` — condición siempre truthy |
| `App.tsx` | 145 | `no-unnecessary-condition` — `??` en lado izquierdo nunca null |
| `BattleScreen.tsx` | 185-186 | `no-unnecessary-condition` — `??` en valores siempre definidos |
| `CharacterCreationScreen.tsx` | 39 | `no-unnecessary-condition` — valor siempre falsy |
| `InventoryTab.tsx` | 107 | `no-unnecessary-condition` — valor siempre truthy |
| `SkillBook.tsx` | 172,193 | `no-unnecessary-condition` — condiciones redundantes |
| `TalentsTab.tsx` | 186 | `no-unnecessary-condition` — valor siempre falsy |
| `shared.tsx` | 49,53,473 | `no-unnecessary-condition` — condiciones redundantes |
| `combat.ts` | 312 | `no-unnecessary-condition` — optional chain en valor no-null |
| `raidCombat.ts` | 72,76,147,156 | `no-unnecessary-condition` — 4 condiciones siempre truthy |
| `CombatScreen.tsx` | 213 | `no-unnecessary-condition` — tipos sin overlap |

---

## 1. RESUMEN DE MECÁNICAS Y ESCEÑA DEL JUEGO

### 1.1 Gameplay Loop Principal

```
┌─────────────────────────────────────────────────────────────┐
│                    GAMEPLAY CORE LOOP                        │
│                                                              │
│  Login → Creación Personaje → GameScreen (Hub)               │
│                                    │                         │
│           ┌────────────────────────┼────────────────┐        │
│           │                        │                │        │
│     AdventureTab             InventoryTab      TalentsTab    │
│     (Expediciones)           (Equip+Skills)    (Árbol)       │
│           │                        │                         │
│     START_EXPEDITION         EQUIP/UNEQUIP                   │
│     Timer (1s tick)          SkillBook                       │
│           │                   Loadouts                       │
│     FINISH_EXPEDITION                                         │
│           │                                                   │
│     TRIGGER_BONUS_BOSS ──→ BattleScreen (Combat)             │
│     (o PVP rival)            │                               │
│                          CombatScreen                        │
│                          EngineBridge                        │
│                               │                              │
│                     ┌─────────┴─────────┐                    │
│                 Victoria            Derrota                   │
│              (loot+xp+gold)    (penalty: -5% gold,           │
│                                 -10% durability)             │
│                     │                 │                       │
│                     └────────┬────────┘                       │
│                        SET_SCREEN: game                       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Comunicación entre Pantallas y Motor

```
UI Layer                          Engine Layer
─────────                         ────────────

CombatScreen/BattleScreen ←──────→ EngineBridge (puente)
     │                                   │
     │  startNewBattle()                 │
     ├──→ createCombatState()  ←─────────┤
     │                                   │
     │  selectAction()                   │
     ├──→ processTurn()  ←───────────────┤
     │     ├── calculateDamage()         │
     │     ├── applyEnemyAI()            │
     │     ├── processStatusEffects()    │
     │     └── enemyUltimateCharge++     │
     │                                   │
     │  consumeItem()                    │
     └──→ processTurn(itemAction) ←──────┘
          

GameStore (Global State)
────────────────────────
dispatch(action) → reducer → _state → listeners → UI re-render
     │                                              │
     └──→ autosave() → localStorage ←────────────────┘
```

### 1.3 Estado Global

- **Patrón:** Custom store (NO Zustand/Redux) con `_state` mutable global + `dispatch()` sincrónico
- **Persistencia:** `localStorage` key `reinos-del-alba-save`, autosave cooldown 2s
- **EventBus:** Pub/sub para eventos de combate (Attack, CriticalHit, Heal, Death, Victory...)

---

## 2. MAPEO DE BUGS, DESCONEXIONES Y EDGE CASES

### 🔴 BUG CRÍTICOS

#### BUG-001: SkillsPanel muestra habilidades incorrectas al cambiar de estilo
**Archivo:** `src/components/game/tabs/shared.tsx:330`  
**Severidad:** CRÍTICO (gameplay-breaking)

```tsx
// Línea 330: Filtra skills SOLO del estilo activo
{activeStyle.skills.filter(s => equipped.includes(s.id)).map((skill) => (
```

**Problema:** Si un jugador equipa habilidades del estilo "Berserker", luego cambia a "Protección" en el SkillBook, el `SkillsPanel` solo muestra skills del estilo activo actual. Las habilidades equipadas del estilo anterior **desaparecen visualmente** del panel, aunque siguen guardadas en `character.skills.equipped`.

**Fix:** Debe buscar en TODOS los estilos de la clase, no solo en `activeStyle`:
```tsx
// Fix propuesto:
const allSkills = Object.values(styles).flatMap(s => s.skills)
{allSkills.filter(s => equipped.includes(s.id)).map((skill) => (
```

---

#### BUG-002: Doble `SkillBook` con lógica divergente
**Archivos:** `src/components/game/tabs/InventoryTab.tsx:12-205` (SkillBook inline) vs `src/components/game/tabs/SkillBook.tsx` (SkillBook dedicado)

**Problema:** Existen DOS componentes `SkillBook` con propósitos diferentes:
- `InventoryTab.tsx` → SkillBook **inline** que gestiona habilidades activas (4 slots + definitiva)
- `SkillBook.tsx` → SkillBook **dedicado** que solo muestra la definitiva con fórmula detallada

`GameScreen.tsx` usa `InventoryTab` (que contiene el SkillBook inline). El `SkillBook.tsx` dedicado **NO se importa en ningún sitio** — es código muerto.

**Impacto:** Confusión de mantenimiento. El SkillBook dedicado tiene UI superior (fórmulas, efectos) pero es inaccesible.

---

#### BUG-003: `EQUIP_ITEM` no valida levelRequired
**Archivo:** `src/store/GameStore.tsx:145-173`

**Problema:** Un jugador nivel 1 puede equipar un item con `levelRequired: 50`. El reducer no verifica `item.levelRequired <= character.level`.

**Impacto:** Items de alto nivel pueden equiparse prematuramente, rompiendo la progresión.

---

#### BUG-004: Currency conversion loop infinito potencial
**Archivo:** `src/store/GameStore.tsx` (ADD_GOLD, ADD_CURRENCY)

```tsx
// Si newGold >= 100 → silverFromGold + newSilver
// Si newSilver >= 100 → goldFromSilver + newGold
// Si newGold < 0 && newSilver > 0 → newSilver -= 1, newGold += 100
```

**Problema:** La conversión gold→silver→gold puede crear un ciclo si `newGold` supera 100 después de la reconversión. Aunque en la práctica es difícil alcanzar, la lógica es frágil.

---

### 🟡 BUGS MODERADOS

#### BUG-005: `handleExecuteAction` en CombatScreen usa closure stale
**Archivo:** `src/components/combat/CombatScreen.tsx:155-185`

```tsx
const handleExecuteAction = useCallback(async (index: number) => {
  // ...
  const isUltimateSlot = index === player.abilities.length && 
    battleState.ultimateSkill != null && playerUltimateCharge >= 100
  // ...
  setPlayerUltimateCharge(prev => isUltimateSlot ? 0 : Math.min(100, prev + 20))
  // ...
}, [isAnimating, isBattleOver, player.abilities, battleState, executeTurn, playerUltimateCharge])
```

**Problema:** `playerUltimateCharge` está en el dependency array pero se lee dentro del callback. Si el usuario hace click rápidamente, el valor puede estar stale entre el render y el callback.

---

#### BUG-006: `executeTurn` causa flicker visual doble
**Archivos:** `BattleScreen.tsx:121-132` y `CombatScreen.tsx:173-184`

```tsx
const executeTurn = useCallback((newEngineState, estadoFinal) => {
  // 1. PRIMER SET: estado intermedio (con HP viejo)
  setBattleState({...estadoFinal, player: {..., currentHp: visualPlayerHpRef.current}})
  
  // 2. TIMEOUT 1200ms: estado final
  animTimerRef.current = setTimeout(() => {
    setBattleState(estadoFinal)  // SEGUNDO SET: HP real
    setVisualPlayerHp(estadoFinal.player.currentHp)
    setIsAnimating(false)
  }, 1200)
}, [])
```

**Problema:** El HP del jugador se muestra dos veces: primero con el valor viejo, luego con el nuevo. Esto crea un "flicker" donde la barra de HP retrocede temporalmente.

---

#### BUG-007: `turnCountRef` asignado pero nunca usado
**Archivo:** `src/components/combat/CombatScreen.tsx:43`

```tsx
const turnCountRef = useRef<number>(0)  // Asignado, nunca incrementado ni leído
```

**Problema:** Código muerto. Probablemente era para trackear turnos pero nunca se implementó.

---

#### BUG-008: `BattleScreen.tsx` no pasa ultimate skill al EngineBridge
**Archivo:** `src/components/battle/BattleScreen.tsx:35`

```tsx
const [initialCombat] = useState(() => EngineBridge.startNewBattle(
  { ...playerData, stats: playerData.stats as Record<string, number> },
  { ...enemyData, stats: enemyData.stats as Record<string, number> }
  // ← FALTA: ultimateSkill y enemyUltimateSkill
))
```

**Problema:** `BattleScreen` (legacy) no pasa las definitivas al motor. Si se usara en vez de `CombatScreen`, el sistema de definitivas no funcionaría.

---

#### BUG-009: `EQUIP_ITEM` empuja item displaced solo al stash, no al inventory
**Archivo:** `src/store/GameStore.tsx:159-166`

```tsx
if (oldItem) {
  const displaced = { ... }
  if (newStash.length < 48) {
    newStash.push(displaced)  // Solo stash, nunca inventory
  }
  // Si stash está lleno → item displaced SE PIERDE silenciosamente
}
```

**Problema:** Si el stash está lleno (48/48) y se equipa un item que reemplaza otro, el item reemplazado se pierde permanentemente. Debería intentar inventory primero.

---

#### BUG-010: `DEFEAT_PENALTY` no tiene feedback visual
**Archivo:** `src/store/GameStore.tsx` (case `DEFEAT_PENALTY`)

**Problema:** Al perder un combate, se aplica penalidad (-5% oro, -10% durabilidad) pero no hay notificación al jugador de cuánto perdió.

---

### 🟢 BUGS MENORES / INCONSISTENCIAS

#### BUG-011: `CharacterStats` muestra "Velocidad: 100%" por defecto
**Archivo:** `src/components/game/tabs/shared.tsx:169`

```tsx
{ label: 'Velocidad', value: `${(totalStats.velocidad ?? 100)}%`, color: '#40c0c0' },
```

**Problema:** Si `velocidad` es undefined, muestra "100%" en vez de "0%". El default debería ser un valor razonable (ej: 100 base), pero el fallback es confuso.

---

#### BUG-012: ` SkillsPanel` no muestra skills de otros estilos equipados
(Igual que BUG-001 pero en `InventoryTab.tsx:260-266`)

```tsx
// InventoryTab.tsx línea ~262 — SKILL BOOK INLINE
const allStyleSkills = Object.values(styles).flatMap(s => s.skills)
const equippedSkills = equipped.map(id => allStyleSkills.find(s => s.id === id)).filter(Boolean)
```

Este SkillBook inline SÍ busca en todos los estilos. Pero el `SkillsPanel` en `shared.tsx` NO. Inconsistencia.

---

#### BUG-013: Login/Register no tiene backend
**Archivo:** `src/components/login/LoginScreen.tsx`

**Problema:** El login, registro y "olvidé contraseña" son mock UI con `setTimeout`. No hay autenticación real. Cualquier usuario puede acceder directamente a `/game`.

---

#### BUG-014: `pvpRivalState.ts` usa estado mutable de módulo
**Archivo:** `src/game/pvpRivalState.ts`

```tsx
let _pendingRival: PvPRival | null = null
let _consumedRival: PvPRival | null = null
```

**Problema:** Variables de módulo mutables. Si dos expediciones PVP terminan simultáneamente (improbable pero posible), el rival pendiente se sobreescribe.

---

#### BUG-015: `RaidTab.tsx` no tiene sistema de combate real
**Archivo:** `src/components/game/tabs/RaidTab.tsx`

**Problema:** El sistema de raids tiene configuración completa (`raids-config.ts`, `raidCombat.ts`) pero `RaidTab.tsx` solo muestra la UI de lobby. El combate real de raids no está conectado.

---

#### BUG-016: `SpellVFXOverlay` usa clases CSS que podrían no existir
**Archivo:** `src/components/battle/SpellVFXOverlay.tsx`

```tsx
const VFX_CLASS: Record<SpellVFX['kind'], string> = {
  slash: 'vfx-slash-effect',
  burst: 'vfx-burst-effect',
  heal: 'vfx-heal-effect',
}
```

**Problema:** Estas clases CSS (`vfx-slash-effect`, etc.) deben estar definidas en `index.css`. Si no lo están, los VFX son invisibles.

---

#### BUG-017: `calculateTotalStats` duplicado entre `utils/stats.ts` y `engine/stats.ts`
**Archivos:** `src/utils/stats.ts` y `src/engine/stats.ts`

**Problema:** Dos implementaciones de `calculateTotalStats` con firmas diferentes:
- `utils/stats.ts`: `calculateTotalStats(character: Character)` — usa character completo
- `engine/stats.ts`: `calculateTotalStats(base, equipment, talentBonus)` — 3 parámetros separados

El de `utils/stats.ts` es el que usa la UI. El de `engine/stats.ts` se exporta pero no se usa en UI. Confusión potencial.

---

#### BUG-018: `activeStyle` puede ser undefined si el character tiene un style inválido
**Archivo:** `src/components/game/tabs/shared.tsx:311`

```tsx
const styles = classAbilities[character.class]
const activeStyle = styles[character.skills.activeStyle]
// Si activeStyle no existe en styles → activeStyle = undefined
// activeStyle.skills → CRASH
```

**Problema:** No hay validación de que `character.skills.activeStyle` exista como key en `styles`.

---

## 3. ANÁLISIS DE CONSISTENCIA VISUAL Y UI

### 3.1 Problemas de Layout

| Componente | Problema | Impacto |
|------------|----------|---------|
| `PaperDoll` | Slots son `w-[64px] h-[64px]` fijos — no responsive | En móviles, los 4+4 slots apilados pueden desbordar |
| `WeaponPaperDoll` | `flex-1` en 3 armas — en pantallas estrechas los nombres se truncan | UX pobre en mobile |
| `InventoryTab` | Grid 3 columnas `lg:grid-cols-3` — en tablets se apila mal | Columna central (SkillBook) pierde contexto |
| `CharacterStats` | `grid-cols-2` fijo — 8 stats en 2 columnas | Ok, pero sin scroll si se agregan más stats |
| `CombatHeader` | `w-24 h-24` para sprites fijos | En mobile, sprites pueden ser muy pequeños |
| `TalentTree` | Posicionamiento absoluto con `left: col*33.33%` | Frágil si se cambia el número de ramas |

### 3.2 Problemas de Estilos

1. **Duplicación de variables CSS:** `index.css` define `--gothic-*` Y `--wow-*` Y `--color-*` — 3 sistemas de naming paralelos para lo mismo.
2. **Colores hardcodeados:** Muchos componentes usan `bg-[#1a1210]`, `text-[#a01020]` etc. en vez de las CSS variables. Dificulta el theming.
3. **Font loading:** `@import url()` de Google Fonts puede causar FOUC (Flash of Unstyled Content).
4. **Z-index layers:** Se usan `z-layer-tooltip`, `z-layer-modal`, `z-layer-notification`, `z-layer-header` pero no se verifica que estén definidos en CSS.

### 3.3 UX Frágil

- **Tooltips en mobile:** Los tooltips hover no funcionan en touch devices. No hay fallback de long-press.
- **Combat log:** Solo muestra 4 líneas (`slice(-4)`). En combates largos, la información se pierde rápido.
- **Loadout selector:** No hay confirmación antes de sobreescribir un loadout existente.
- **Alijo:** 48 slots hardcodeados. Sin indicador visual de "lleno" cuando stash está al máximo.
- **Venta de items:** Click derecho → Vender. Sin confirmación. Venta accidental posible.

---

## 4. VERIFICACIÓN ESTÁTICA — Warnings Activos

### Errores de Build (16)

```
ERROR  App.tsx:61              — setState síncrono en useEffect (performance)
ERROR  CombatHeader.tsx:143-144 — import() type annotations prohibidas
ERROR  CombatScreen.tsx:6      — Skill no usado
ERROR  CombatScreen.tsx:14     — UltimateChargeBar no usado
ERROR  CombatScreen.tsx:43     — turnCountRef asignado no usado
ERROR  UltimateChargeBar.tsx:17 — param 'side' no usado
ERROR  SkillBook.tsx:1         — useState no usado
ERROR  TalentsTab.tsx:8-9      — calculateSkillDamage, calculateTotalStats no usados
ERROR  shared.tsx:7            — StatBlock no usado
ERROR  shared.tsx:504          — non-null assertion (ultimateSkill!)
ERROR  enginebridge.ts:18,33   — import() type annotations prohibidas
ERROR  GameStore.tsx:199        — prefer-const en newInventory
ERROR  combat.ts:645           — no-useless-assignment en enemySkill
```

### Warnings (18)

```
WARN  App.tsx:45,145           — condiciones siempre truthy
WARN  BattleScreen.tsx:185-186 — ?? en valores siempre definidos
WARN  CharacterCreationScreen:39 — condición siempre falsy
WARN  InventoryTab.tsx:107     — condición siempre truthy
WARN  SkillBook.tsx:172,193    — condiciones redundantes
WARN  TalentsTab.tsx:186       — condición siempre falsy
WARN  shared.tsx:49,53,473     — condiciones redundantes
WARN  combat.ts:312            — optional chain innecesaria
WARN  raidCombat.ts:72,76,147,156 — 4 condiciones siempre truthy
WARN  CombatScreen.tsx:213     — tipos sin overlap
```

---

## 5. CÓDIGO CLAVE — ANÁLISIS CRÍTICO

### 5.1 Motor de Combate — Puntos de Atención

**`src/engine/combat.ts:570-650` — Enemy Ultimate Logic:**
```typescript
// Línea 635: enemyUltimateCharge se incrementa SIEMPRE, incluso si el enemy ya tiene ultimate ready
currentState.enemyUltimateCharge = Math.min(100, (currentState.enemyUltimateCharge ?? 0) + 20)

// Línea 645: enemySkill se reasigna pero la nueva asignación no se usa
let enemySkill: Skill | null = null  // ← no-useless-assignment
// ... se asigna después pero larama de código anterior ya la inicializó
```

**`src/engine/combat.ts:420-440` — Ultimate Minimum Damage:**
```typescript
if (skill.isUltimate) {
  baseDamage = Math.max(30, baseDamage)  // Mínimo 30 —确保 que ultimates siempre hacen daño
}
```
✅ Correcto — previene que ultimates hagan 0 daño con stats bajos.

### 5.2 GameStore — Puntos de Atención

**`src/store/GameStore.tsx:145-173` — EQUIP_ITEM:**
```typescript
// El item displaced se va al stash SIN verificar inventory primero
if (newStash.length < 48) {
  newStash.push(displaced)
}
// Si stash lleno →item PERDIDO
```

**`src/store/GameStore.tsx:176-213` — UNEQUIP_ITEM (CORREGIDO):**
```typescript
// Ya verifica espacio antes de unequip
const hasInventorySpace = state.character.inventory.length < 20
const hasStashSpace = state.character.stash.length < 48
if (!hasInventorySpace && !hasStashSpace) return state  // ✅ Correcto
```

### 5.3 EngineBridge — Puntos de Atención

**`src/game/enginebridge.ts:150-196` — selectAction:**
```typescript
// Línea 180-183: Descarga cargas del jugador
if (playerAction.type === 'skill') {
  const current = newUi.player.abilities[abilityIndex].currentCharges
  newUi.player.abilities[abilityIndex].currentCharges = Math.max(0, current - 1)
}
// ⚠️ No verifica si abilityIndex es válido (puede ser undefined)
```

### 5.4 Persistencia — Puntos de Atención

**`src/store/persistence.ts` — isValidCharacter:**
```typescript
// Valida estructura pero NO coherencia:
// - Items equipped que no existen en inventory
// - Stats negativos
// - experienceToNext incoherente con level
// - talents[] con IDs inexistentes
```

---

## 6. RESUMEN DE HALLAZGOS

### Por Severidad

| Severidad | Cantidad | Ejemplos |
|-----------|----------|----------|
| 🔴 Crítico | 4 | BUG-001 (SkillsPanel), BUG-002 (código muerto), BUG-003 (sin level check), BUG-009 (item loss) |
| 🟡 Moderado | 6 | BUG-005 (stale closure), BUG-006 (flicker), BUG-008 (legacy sin ults), BUG-010 (sin feedback) |
| 🟢 Menor | 8 | BUG-011 (default speed), BUG-013 (mock login), BUG-017 (stats duplicados), BUG-018 (activeStyle crash) |
| ⚠️ ESLint | 34 | 16 errors + 18 warnings |
| 🎨 UI/UX | 6+ | Tooltips sin mobile, layout frágil, colores hardcodeados |

### Cobertura de Test vs Riesgo

| Módulo | Tests | Riesgo | Estado |
|--------|-------|--------|--------|
| `engine/combat.ts` | 20 | Alto | ✅ Cubierto |
| `engine/skills.ts` | 7 | Medio | ✅ Cubierto |
| `engine/stats.ts` | 8 | Medio | ✅ Cubierto |
| `engine/equipment.ts` | 8 | Alto | ✅ Cubierto |
| `engine/enemyAI.ts` | 7 | Medio | ✅ Cubierto |
| `store/GameStore.tsx` | 37 | Crítico | ⚠️ Parcial (falta test de EQUIP_ITEM con stash lleno) |
| `game/enginebridge.ts` | 0 | Alto | ❌ Sin tests |
| `game/expeditions.ts` | 0 | Medio | ❌ Sin tests |
| `game/loot.ts` | 0 | Medio | ❌ Sin tests |
| `engine/raidCombat.ts` | 0 | Bajo | ❌ Sin tests |
| `components/*` | 0 | Alto | ❌ Sin tests de integración |

### Priorización de Fixes

1. **P0 (Inmediato):** BUG-001 (SkillsPanel muestra skills incorrectas)
2. **P0:** BUG-009 (item loss al equipar con stash lleno)
3. **P1 (Esta semana):** BUG-003 (sin level check en equip), BUG-005 (stale closure), BUG-006 (flicker visual)
4. **P2 (Sprint siguiente):** BUG-002 (eliminar código muerto), BUG-010 (feedback de penalidad), BUG-018 (activeStyle crash)
5. **P3 (Backlog):** ESLint errors, tooltips mobile, colores hardcodeados, tests faltantes

---

*Diagnóstico generado el 2026-07-26 para auditoría de código senior.*
