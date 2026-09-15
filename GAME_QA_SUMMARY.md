# GAME_QA_SUMMARY.md — Auditoría de QA & Playtesting Técnico

> **Proyecto:** Reinos del Alba  
> **Fecha:** 2026-07-26  
> **Versión:** 1.0.0  
> **Stack:** React 19 + TypeScript 5.6 + Vite 5.4 + Tailwind CSS 4 + Framer Motion 12 + Vitest 4.1  
> **Autor del informe:** opencode (DevOps / System Architect role)

---

## 1. VERIFICACIÓN DE ESTADO

### TypeScript (`npx tsc -b`)
```
Exit code: 0 — 0 errores
```

### Tests (`npx vitest run`)
```
Test Files  7 passed (7)
Tests       89 passed (89)
Duration    ~3s
Exit code: 0
```

### Archivos de test
| Suite | Archivo | Tests |
|-------|---------|-------|
| Combate | `src/engine/__tests__/combat.test.ts` | ~20 |
| Habilidades | `src/engine/__tests__/skills.test.ts` | 7 |
| Stats | `src/engine/__tests__/stats.test.ts` | 8 |
| Equipamiento | `src/engine/__tests__/equipment.test.ts` | 8 |
| Enemy AI | `src/engine/__tests__/enemyAI.test.ts` | 7 |
| Afijos | `src/engine/__tests__/affixes.test.ts` | 2 |
| GameStore | `src/store/__tests__/GameStore.test.ts` | ~37 |

---

## 2. ÁRBOL DE ARCHIVOS RELEVANTE

```
reinos-del-alba/
├── package.json                      # Dependencias y scripts
├── tsconfig.json                     # Config TypeScript (strict, ESNext, path aliases)
├── vite.config.ts                    # Vite + React + Tailwind
├── vitest.config.ts                  # Config de tests
│
└── src/
    ├── App.tsx                        # Router principal (lazy-loading de pantallas)
    ├── main.tsx                       # Entry point React
    ├── index.css                      # Estilos globales + Tailwind
    │
    ├── types/
    │   ├── index.ts                   # Re-exports barrel
    │   ├── game.types.ts              # Tipos centrales: Character, Item, Skill, StatBlock, Talent, Equipment, RaidBoss...
    │   ├── game.ts                    # Re-exports desde index
    │   ├── items.ts                   # Re-exports ItemDefinition, Equipment
    │   └── combat.ts                  # CombatState, CombatAction, CombatEnemy, StatusInstance, DamageResult...
    │
    ├── store/
    │   ├── GameStore.tsx              # Estado global: reducer + dispatch + GameProvider + persistencia
    │   ├── persistence.ts            # localStorage save/load/autosave (cooldown 2s)
    │   └── __tests__/
    │       └── GameStore.test.ts      # Tests de reducer (37 tests)
    │
    ├── engine/
    │   ├── combat.ts                  # MOTOR PRINCIPAL: createCombatState, calculateDamage, processTurn
    │   ├── skills.ts                  # calculateSkillDamage, getDefaultWeaponDamage
    │   ├── stats.ts                   # createBaseStats, calculateTotalStats, getMaxHp, getMaxMana
    │   ├── enemyAI.ts                 # applyEnemyAI (priorización de habilidades por contexto)
    │   ├── equipment.ts               # equipItem, unequipItem, getWeaponDamage, getEquipmentStatBlock
    │   ├── expeditions.ts             # calculateRewards, rollRarity, isExpeditionComplete
    │   ├── raidCombat.ts              # processRaidTurn (sistema de raids por fases)
    │   ├── utils.ts                   # roll() (Math.random wrapper)
    │   ├── testUtils.ts              # createMockPlayer, createMockEnemy, createBattleState
    │   └── __tests__/                 # 6 archivos de test
    │
    ├── game/
    │   ├── enginebridge.ts            # EngineBridge: puente entre UI (BattleScreen) y motor (combat.ts)
    │   ├── config.ts                  # BASE_STATS_RAZAS, BASE_STATS_CLASES (config de balance)
    │   ├── combat-config.ts           # Constantes de combate: hit chance, crit, mitigation, potions, status...
    │   ├── enemies.ts                 # MONSTER_POOL + generateEnemyForLevel/generateBossForLevel
    │   ├── loot.ts                    # generateLoot (drop de items por nivel/clase)
    │   ├── bonusBoss.ts               # generateBonusBossForExpedition (bosses bonus post-expedición)
    │   └── pvpRivalState.ts           # Estado mutable de rivales PVP (pending/consumed)
    │
    ├── data/
    │   ├── gameData.ts                # ULTIMATE_SKILLS, classAbilities (12 estilos, ~60 skills), talentTree, expeditions
    │   ├── pvpRivals.ts               # 5 rivales PVP predefinidos con stats/rewards
    │   ├── sprites.ts                 # Mapa de sprites por race+class
    │   └── items/                     # Items por clase: Guerrero.ts, Mago.ts, Druida.ts, Brujo.ts, index.ts
    │
    ├── components/
    │   ├── battle/                    # Sistema de combate visual (v1 - grid-based)
    │   │   ├── BattleScreen.tsx       # Screen de combate legacy
    │   │   ├── CombatHeader.tsx       # Barras HP, sprites, floating damage, VFX, statuses, ultimate bars
    │   │   ├── AbilityGrid.tsx        # Grid 2x2 de habilidades + pociones
    │   │   ├── CombatLog.tsx          # Log de combate scrollable
    │   │   ├── VictoryModal.tsx       # Modal de victoria/derrota con loot
    │   │   ├── SpellVFXOverlay.tsx    # Overlay de efectos visuales
    │   │   └── types.ts              # PlayerInputData, EnemyInputData, FloatingDamage, SpellVFX, STATUS_ICONS
    │   │
    │   ├── combat/                    # Sistema de combate v2 (bar-based)
    │   │   ├── CombatScreen.tsx       # Screen de combate actual (se usa en App.tsx)
    │   │   ├── AbilityBar.tsx         # Barra horizontal de habilidades
    │   │   ├── AbilityDetailPanel.tsx # Panel de detalle de habilidad seleccionada
    │   │   └── UltimateChargeBar.tsx  # Barra de carga de habilidad definitiva
    │   │
    │   ├── game/
    │   │   ├── GameScreen.tsx         # Screen principal con tabs (sidebar layout)
    │   │   ├── ShopScreen.tsx         # Tienda de compra/venta
    │   │   └── tabs/
    │   │       ├── AdventureTab.tsx   # Expediciones por categoría/dificultad
    │   │       ├── InventoryTab.tsx   # Equipamiento + SkillBook + Alijo (3 columnas)
    │   │       ├── TalentsTab.tsx     # Árbol de talentos
    │   │       ├── RaidTab.tsx        # Raids por fases (lobby → combat → victory/defeat)
    │   │       ├── shared.tsx         # PaperDoll, CharacterStats, ExperienceBar, SkillsPanel, LevelUpNotification
    │   │       ├── SkillBook.tsx      # Equipamiento de habilidades activas + definitiva
    │   │       └── LoadoutSelector.tsx# Guardar/cargar sets de equipamiento
    │   │
    │   ├── common/                    # Componentes reutilizables
    │   │   ├── GothicButton.tsx       # Botón con estilo gótico
    │   │   ├── GothicContextMenu.tsx  # Menú contextual (click derecho)
    │   │   ├── GothicInput.tsx        # Input gótico
    │   │   ├── GothicPanel.tsx        # Panel contenedor
    │   │   ├── InventorySlot.tsx      # Slot de inventario con tooltip hover
    │   │   ├── LoadingSpinner.tsx     # Spinner de carga
    │   │   ├── SplashScreen.tsx       # Pantalla de carga inicial
    │   │   ├── ErrorBoundary.tsx      # Error boundary global
    │   │   ├── PageTransition.tsx     # Wrapper de transición de pantalla
    │   │   ├── Tooltip.tsx            # Tooltip genérico (fixed position)
    │   │   └── index.ts              # Barrel exports
    │   │
    │   ├── creation/
    │   │   └── CharacterCreationScreen.tsx  # Creación de personaje (raza + clase + nombre)
    │   │
    │   ├── login/
    │   │   └── LoginScreen.tsx        # Login + continuar partida guardada
    │   │
    │   └── ui/
    │       ├── GothicFrame.tsx        # Marco decorativo gótico
    │       └── TopNavBar.tsx          # Navegación superior por tabs
    │
    ├── events/
    │   └── EventBus.ts               # Bus de eventos global (Attack, CriticalHit, Heal, Death, Victory...)
    │
    ├── utils/
    │   ├── stats.ts                   # calculateTotalStats (override de engine/stats.ts para UI)
    │   └── smartLoot.ts              # generatePvPLoot (loot diferenciado para PVP)
    │
    ├── constants/
    │   └── theme.ts                   # RARITY_COLORS
    │
    ├── config/
    │   └── game.ts                    # GAME_CONFIG (título, subtítulo, versión)
    │
    └── test/
        └── setup.ts                   # Jest-DOM setup para tests
```

---

## 3. FLUJO DE DATOS PRINCIPAL

### 3.1 Ciclo de vida de la aplicación

```
App.tsx
  └─ GameProvider (GameStore.tsx)
       └─ Context global: { character, combat, screen, expedition, levelUpCount }
            └─ dispatch(action) → reducer → state → listeners → autosave
```

**Pantallas (lazy-loaded):**
```
login → creation → game → battle / shop
                         ↕
                    expedition (async timer → bonusBoss → battle)
```

### 3.2 Flujo de combate (EngineBridge pattern)

```
App.tsx (onScreenChange)
  │
  ├─ Genera enemyData (generateEnemyForLevel / consumedRival / bonusBossData)
  ├─ Genera lootItem (generateLoot / generatePvPLoot)
  │
  └─ <CombatScreen playerData={...} enemyData={...} onBattleEnd={fn} />
       │
       ├─ EngineBridge.startNewBattle(playerData, enemyData, potions, ultSkill, enemyUltSkill)
       │    └─ createCombatState([playerActor], [enemyActor]) → { engineState, uiState }
       │
       ├─ handleExecuteAction(index) → EngineBridge.selectAction(engine, ui, index)
       │    └─ processTurn(engineState, { type: 'skill', ... }) → newCombatState
       │         ├─ calculateDamage(action, state, skill) → { results, log, newState }
       │         ├─ applyEnemyAI(enemy, state) → enemyAction
       │         ├─ Enemy ultimate charge (+20/turn, execute at 100%)
       │         └─ processStatusEffects(state) → poison/bleed/burn ticks
       │
       └─ onBattleEnd(winner)
            ├─ 'player': dispatch(FINISH_EXPEDITION) or dispatch(RECORD_PVP_RESULT)
            └─ 'enemy': dispatch(DEFEAT_PENALTY) — 5% gold loss, 10% durability loss
```

### 3.3 Sistema de equipamiento

```
InventoryTab (3 columnas: PaperDoll | SkillBook | Alijo)
  │
  ├─ PaperDoll → drag-free click: EQUIP_ITEM / UNEQUIP_ITEM
  │    ├─ EQUIP_ITEM: busca item por ID en inventory/stash → lo mueve a equipment[slot]
  │    └─ UNEQUIP_ITEM: verifica espacio (inv<20, stash<48) → retorna a inventory o stash
  │
  ├─ SkillBook: equipa hasta 4 habilidades + 1 definitiva
  │    └─ Dispatch: UPDATE_CHARACTER → skills.equipped[]
  │
  └─ Alijo: grid 8×6 de 48 slots, muestra items del stash
       └─ InventorySlot con tooltip hover + click derecho (equipar/vender)
```

### 3.4 Sistema de expediciones

```
AdventureTab
  │
  ├─ Categorías: misiones (10-20min), mazmorras (45-90min), bandas (180-600min)
  ├─ Dificultad: normal (×1), heroico (×1.5), mitico (×2.5)
  │
  ├─ START_EXPEDITION → Timer (setInterval 1s)
  │    └─ isExpeditionComplete → TRIGGER_BONUS_BOSS → generateBonusBossForExpedition
  │         └─ bonusBossReady → START_BONUS_BATTLE → screen='battle'
  │
  └─ FINISH_EXPEDITION → calculateRewards → gold + xp + item + talentPoint
```

### 3.5 Motor de combate — Fórmulas clave

```
DAÑO BÁSICO:
  baseDamage = roll(weapon.max - weapon.min + 1) + weapon.min - 1

DAÑO CON HABILIDAD:
  calculated = calculateSkillDamage(skill, stats, weapon)
  baseDamage = roll(max - min + 1) + min - 1
  Si skill.isUltimate: baseDamage = max(30, baseDamage)  // mínimo 30

CRÍTICO:
  probCrit += EQUIP_CRIT_BONUS (5) si item tiene effect 'critBonus'
  Si roll(100) ≤ min(75, probCrit): baseDamage × (1 + dañoCrit/100)

MITIGACIÓN:
  mitigated = base × clamp(armor/(armor+100), 0, 0.6)
  finalDamage = max(1, base - mitigated)
  physical → armadura, magical → resistenciaMagica

EVASIÓN:
  hitChance = clamp(precision - esquiva, 20, 95)
  Si ceguera activa: precision × 0.5

ROBO DE VIDA:
  healAmount = finalDamage × (roboVida + EQUIP_LIFE_STEAL_BONUS) / 100
  Solo aplica para player (side === 'ally')

ENEMY AFFIXES:
  vampiric: heal 25% del daño infligido
  thorns: refleja 20% del daño recibido al atacante
  frenzy: (frenzy a ≤40% HP — visual flag, no mechanical bonus)

ULTIMATE ENEMY:
  +20% carga por turno, ejecuta a 100% → target = ally con menor HP
  Reset a 0 después de ejecutar

STATUS EFFECTS (processStatusEffects al final del turno):
  veneno: 5 daño/turno
  sangrado: 8 daño/turno
  quemadura: 6 daño/turno
  congelacion/aturdimiento: skip turno (1 turno)
  silencio: fuerza ataque básico en vez de skill
  ceguera: precision × 0.5
  buff/debuff: armadura, resistenciaMagica, fuerza, inteligencia, esquiva, thorns
```

### 3.6 Balance de clases (BASE_STATS_CLASES)

| Clase | HP Mod | MP Mod | FUE | AGI | INT | VIT | ARM | RegenMana | Daño Tipo |
|-------|--------|--------|-----|-----|-----|-----|-----|-----------|-----------|
| Guerrero | ×1.5 | ×0.5 | 18 | 10 | 7 | 15 | 10 | 1 | fuerza |
| Mago | ×0.8 | ×2.0 | 7 | 10 | 18 | 12 | 3 | 8 | inteligencia |
| Druida | ×1.2 | ×1.2 | 15 | 10 | 14 | 13 | 6 | 6 | inteligencia |
| Brujo | ×1.1 | ×1.1 | 15 | 10 | 16 | 10 | 5 | 6 | inteligencia (+5 roboVida) |

### 3.7 Progresión

```
XP por nivel: level × 100
XP para subir: acumula hasta alcanzar threshold → level++
XP por expedición: time × 15 × difficultyMult × (1 + (level-1) × 0.05)
Oro por expedición: time × 12 × difficultyMult × (1 + (level-1) × 0.05)
Oro derrota penalty: -5%
Durabilidad derrota penalty: ×0.9
Talent point: 1 por nivel + 1 por expedición ≥45min
```

---

## 4. COMPONENTES NÚCLEO — RESUMEN EJECUTIVO

### 4.1 Motor de combate (`src/engine/combat.ts` — 864 líneas)

**Funciones exportadas:**
- `createCombatState(allies, enemies, combatType, format)` — Inicializa estado
- `calculateDamage(action, state, skill)` — Cálculo de daño completo (físico/mágico, crítico, mitigación, status, affixes, life steal, ultimate min 30)
- `processTurn(state, playerAction)` — Turno completo: player → enemy AI → status ticks → mana regen → incremento de turno
- `createEnemy(id, name, level, stats, abilities, isBoss)` — Factory de enemigos con fórmulas de HP/armadura/recompensas
- `createPlayerActor(id, name, stats, weaponDamage, level, effects, hpMod, mpMod)` — Factory de jugador

**Patrón:** Clone-before-mutate. `cloneCombatState` crea deep copy antes de cada modificación.

### 4.2 GameStore (`src/store/GameStore.tsx` — ~816 líneas)

**Arquitectura:** Custom store (NO Zustand) con:
- Módulo `_state` global mutable (singleton)
- `dispatch(action)` sincrónico → reducer → notify listeners → autosave
- React Context `GameProvider` + `useGameStore()` hook
- Autosave en 20+ action types con cooldown de 2s
- Persistencia via localStorage (`reinos-del-alba-save`)

**30 tipos de action** incluyendo:
- CRUD de personaje, equipamiento, inventario, stash
- Combate: SET_COMBAT, UPDATE_COMBAT
- Progresión: ADD_EXPERIENCE, LEVEL_UP, LEARN_TALENT
- Expediciones: START/FINISH_EXPEDITION, TRIGGER_BONUS_BOSS
- PVP: RECORD_PVP_RESULT (ELO K=32)
- Loadouts: SAVE_LOADOUT, EQUIP_LOADOUT

### 4.3 EngineBridge (`src/game/enginebridge.ts` — 264 líneas)

**Función:** Traduce entre el motor de combate puro (tipos `CombatState/CombatAction`) y la UI (`BattleState/BattleEntity`).

**Métodos estáticos:**
- `startNewBattle(playerData, enemyData, potions, ultSkill, enemyUltSkill)` → `CombatResult`
- `selectAction(engineState, uiState, abilityIndex)` → `CombatResult`
- `consumeItem(engineState, uiState, itemType)` → `CombatResult`

### 4.4 EventBus (`src/events/EventBus.ts` — 53 líneas)

**Eventos soportados:** Attack, CriticalHit, Miss, Heal, StatusApplied, Death, LevelUp, TurnStart, TurnEnd, Victory, Defeat, ArenaVictory, ArenaDefeat, ItemEquipped, ItemUnequipped, QuestComplete

**Patrón:** Pub/sub con wildcard `*`. Usado para sincronizar floating damage numbers, VFX, y shakes entre motor y UI.

### 4.5 Data Layer (`src/data/gameData.ts` — ~500 líneas)

**Contenido:**
- `ULTIMATE_SKILLS`: 4 habilidades definitivas (una por clase) con status effects y resource types
- `classAbilities`: 4 clases × 3 estilos = 12 estilos × ~5 skills = ~60 habilidades
- `talentTree`: 10 talentos en 4 ramas (ofensiva, maestría, supervivencia, central)
- `expeditions`: 9 expediciones (3 misiones, 3 mazmorras, 3 bandas) × 3 dificultades
- `raceProfiles`: 8 razas con stats y descripciones

---

## 5. SISTEMA DE PERSISTENCIA

```typescript
// persistence.ts
SAVE_KEY = 'reinos-del-alba-save'
AUTOSAVE_COOLDOWN = 2000ms

// Guarda SOLO character (no combat state ni expedition)
localStorage.setItem(SAVE_KEY, JSON.stringify(character))

// Validación en carga:
// - name (string, non-empty)
// - level (number ≥ 1)
// - race, class (strings)
// - wallet (gold/silver/copper numbers)
// - inventory[], equipment{}, talents[], stats{}, skills{}
// - experience, experienceToNext
// - arenaRank? (eloRating, wins, losses)
```

---

## 6. COBERTURA DE TESTS POR MÓDULO

| Módulo | Tests | Estado |
|--------|-------|--------|
| `engine/combat.ts` | 20 | ✅ PASS |
| `engine/skills.ts` | 7 | ✅ PASS |
| `engine/stats.ts` | 8 | ✅ PASS |
| `engine/equipment.ts` | 8 | ✅ PASS |
| `engine/enemyAI.ts` | 7 | ✅ PASS |
| `engine/affixes.ts` | 2 | ✅ PASS |
| `store/GameStore.tsx` | 37 | ✅ PASS |
| **TOTAL** | **89** | **✅ ALL PASS** |

### Módulos SIN cobertura de test (candidatos para QA manual o futuros tests):
- `src/game/enginebridge.ts` — Puente UI↔motor
- `src/game/expeditions.ts` — Lógica de recompensas
- `src/game/loot.ts` — Generación de loot
- `src/game/bonusBoss.ts` — Generación de bosses bonus
- `src/engine/raidCombat.ts` — Sistema de raids
- `src/components/*` — Todos los componentes UI
- `src/store/persistence.ts` — Persistencia localStorage
- `src/events/EventBus.ts` — Sistema de eventos

---

## 7. RIESGOS Y NOTAS PARA QA

### 7.1 Riesgos identificados

1. **Estado mutable en GameStore** — `_state` es un objeto mutable global. Aunque el reducer retorna nuevos objetos, si algún path muta directamente `_state`, causará bugs silenciosos. `structuredClone` se usa en EngineBridge pero no en todo el store.

2. **Duplicación de pantallas de combate** — Existen `BattleScreen.tsx` (legacy, grid-based) y `CombatScreen.tsx` (actual, bar-based). App.tsx importa `CombatScreen`. `BattleScreen.tsx` podría estar obsoleto.

3. **`roll()` como wrapper de Math.random** — Tests mockean `Math.random` o el módulo `utils`. Si se agregan tests que no mockean, serán no-determinísticos.

4. **PVP Rival State es mutable** — `pvpRivalState.ts` usa variables de módulo mutables (`_pendingRival`, `_consumedRival`). No es thread-safe (aunque en browser single-threaded es aceptable), pero dificulta testing.

5. **Límites de inventario hardcodeados** — Inventory: 20 slots, Stash: 48 slots. Sin validación centralizada de capacidad.

6. **ELO rating sin bounds** — `calculateElo` puede generar ratings negativos o extremadamente altos sin clamp.

7. **No hay validación de integridad de save** — `isValidCharacter` valida estructura pero no coherencia (ej: equipped items que no están en inventory, stats negativos, etc.).

8. **Falta test de raidCombat.ts** — El sistema de raids por fases no tiene tests unitarios.

### 7.2 Cobertura de UX no testada
- Tooltips hover en PaperDollSlots (recién implementados)
- Transiciones de pantalla (Framer Motion)
- Responsive design (Tailwind sm:/lg:)
- Keyboard shortcuts en combate (1-4 para ejecutar, Q/W/E/R para seleccionar)
- Navegación por tabs
- Context menus (click derecho en inventario)

---

## 8. COMANDOS DE VERIFICACIÓN

```powershell
# Verificar que no hay errores de TypeScript
npx tsc -b

# Ejecutar suite completa de tests
npx vitest run

# Tests en watch mode (desarrollo)
npx vitest

# Lint
npx eslint src/

# Build de producción
npm run build
```

---

*Informe generado automáticamente el 2026-07-26 para auditoría de QA y Playtesting Técnico.*
