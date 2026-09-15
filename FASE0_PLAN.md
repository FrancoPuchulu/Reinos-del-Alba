# FASE 0 — Plan de Ejecución: Reparar Build sin Modificar el Juego

> **Objetivo:** Restaurar el build y el lint a estado funcional.
> **Restricción ABSOLUTA:** NO se inventa funcionalidad nueva, NO se modifica lógica de juego,
> NO se cambia balance, NO se altera comportamiento visible del usuario.
> Solo se corrigen errores de compilación y warnings de lint que no alteran el runtime.

---

## Contexto

El proyecto tiene 2 errores de TypeScript que impiden `npm run build` y `npx tsc -b`.
Además tiene 20 warnings de ESLint que no impiden el build pero ensucian el lint.
El estado actual del juego es **funcional en runtime** — los bugs son de tipado y lint, no de lógica.

---

## PARTE 1: Error de TypeScript (BLOCKER)

### Problema exacto

**Archivo:** `src/store/GameStore.tsx`, línea 133
**Error:**
```
TS2339: Property 'levelRequired' does not exist on type 'InventoryItem'.
```

**Código actual (línea 133):**
```typescript
if (sourceItem.levelRequired && sourceItem.levelRequired > state.character.level) return state
```

**Causa:** El tipo `InventoryItem` (definido en `src/types/game.types.ts:129-143`) no tiene la propiedad `levelRequired`. Solo `ItemDefinition` (línea 65-79) la tiene.

### Fix permitido

**Opción A (recomendada — mínima invasión):**

1. Agregar `levelRequired?: number` al tipo `InventoryItem` en `src/types/game.types.ts` línea ~142:
```typescript
export interface InventoryItem {
  id?: string
  name: string
  source: string
  rarity: Rarity
  stats?: StatBlock
  slot?: string
  equipped?: boolean
  icon?: string
  baseDamage?: number
  description?: string
  durability?: number
  maxDurability?: number
  price?: number
  levelRequired?: number  // ← AGREGAR ESTA LÍNEA
}
```

2. En `src/game/loot.ts`, línea ~31-42, agregar `levelRequired` al objeto retornado para que el campo se propague cuando se genera loot:
```typescript
return {
  id: item.id,
  name: item.name,
  source: 'botin',
  rarity,
  stats: item.stats,
  slot: item.slot,
  description: item.description,
  durability: item.durability,
  maxDurability: item.maxDurability,
  equipped: false,
  levelRequired: item.levelRequired,  // ← AGREGAR ESTA LÍNEA
}
```

3. Verificar que `src/utils/smartLoot.ts` (función `generatePvPLoot`) también incluya `levelRequired` si genera items.

**¿Por qué esta opción?** Respeta la intención original del código (validación de nivel al equipar) sin cambiar comportamiento. Si un item no tiene `levelRequired`, el campo es `undefined` y el check en línea 133 (`sourceItem.levelRequired && ...`) es falsy — mismo comportamiento que antes del fix roto.

### Lo que NO se debe hacer (Parte 1)

- NO eliminar la línea 133 (rompería la validación de nivel)
- NO comentar el check con `// @ts-ignore`
- NO cambiar `InventoryItem` a `any`
- NO modificar la lógica del reducer `EQUIP_ITEM` más allá de lo descrito
- NO tocar `ItemDefinition` ni `Equipment`

---

## PARTE 2: Warnings de ESLint (20 warnings)

### Regla general

Cada warning es un `@typescript-eslint/no-unnecessary-condition`. Esto significa que TypeScript ya garantiza que la condición es siempre truthy o falsa, por lo que la condición es redundante.

**Fix estándar para cada caso:**

| Tipo de warning | Fix | Ejemplo |
|-----------------|-----|---------|
| "value is always truthy" | Eliminar el `if`/`&&` wrapper, quedarse con el contenido | `if (x) { foo() }` → `foo()` |
| "value is always falsy" | Eliminar el bloque completo (dead code) o re-evaluar si es un bug | `if (x) { ... }` → eliminar o commentar |
| "left-hand side of `??` possibly null" | Reemplazar `??` con el valor directo si nunca es null | `x ?? default` → `x` (si x nunca es null) |
| "unnecessary optional chain" | Reemplazar `x?.y` con `x.y` | `x?.y` → `x.y` |

### Lista exacta de warnings con fix

#### 1. `src/App.tsx:45` — siempre truthy
**Línea actual:** Condición en useEffect que siempre es truthy.
**Fix:** Eliminar la condición innecesaria. Leer contexto para decidir si el `if` se elimina o se reemplaza.

#### 2. `src/App.tsx:147` — `??` en lado izquierdo nunca null
**Línea actual:** `bonusBossData ?? null` o similar.
**Fix:** Reemplazar `?? fallback` con el valor directo.

#### 3-4. `src/components/battle/BattleScreen.tsx:185-186` — `??` en valores siempre definidos
**Fix:** Reemplazar `?? fallback` con el valor directo.

#### 5. `src/components/combat/CombatScreen.tsx:209` — tipos sin overlap
**Línea:** Comparación entre tipos que TypeScript sabe que nunca se superponen.
**Fix:** Revisar si la condición es dead code y eliminarla, o si el tipo necesita una unión más amplia (solo si es correcto).

#### 6. `src/components/creation/CharacterCreationScreen.tsx:39` — siempre falsy
**Fix:** Eliminar el bloque `if` (es dead code).

#### 7. `src/components/game/tabs/InventoryTab.tsx:107` — siempre truthy
**Fix:** Eliminar la condición innecesaria.

#### 8. `src/components/game/tabs/TalentsTab.tsx:184` — siempre falsy
**Fix:** Eliminar el bloque `if` (es dead code).

#### 9-13. `src/components/game/tabs/shared.tsx:49,53,470,472,476,507` — mixto
- Líneas 49, 476: `??` innecesario → valor directo
- Líneas 53, 472: siempre truthy → eliminar condición
- Líneas 470: siempre falsy → eliminar bloque
- Línea 507: optional chain innecesario → quitar `?.`

#### 14. `src/engine/combat.ts:312` — optional chain innecesario
**Fix:** Reemplazar `x?.y` con `x.y`.

#### 15-18. `src/engine/raidCombat.ts:72,76,147,156` — condiciones siempre truthy
**Fix:** Eliminar las condiciones innecesarias.

#### 19. `src/store/GameStore.tsx:373` — `??` innecesario
**Fix:** Reemplazar `?? fallback` con el valor directo.

### Lo que NO se debe hacer (Parte 2)

- NO agregar `// eslint-disable-next-line` para ocultar warnings (a menos que sea ABSOLUTAMENTE necesario y esté documentado por qué)
- NO cambiar la lógica del juego — solo eliminar código redundante
- NO reordenar imports ni refactorizar funciones completas
- NO tocar archivos que no tengan warnings
- NO cambiar firmas de funciones ni tipos

---

## PARTE 3: Verificación

### Checkpoint obligatorio antes de cada commit

```powershell
# 1. TypeScript debe pasar SIN errores
npx tsc -b
# Esperado: exit code 0, 0 errores

# 2. Tests deben pasar SIN cambios
npx vitest run
# Esperado: 89/89 tests pasan

# 3. ESLint debe pasar SIN errores (warnings aceptados)
npx eslint src/
# Esperado: exit code 0, 0 errores
```

### Checkpoint final

```powershell
# Build completo de producción
npm run build
# Esperado: exit code 0, carpeta dist/ generada
```

---

## Orden de ejecución recomendado

1. **Primero** fix de TypeScript (Parte 1) — desbloquea el build
2. **Segundo** warnings de ESLint (Parte 2) — limpia el lint
3. **Tercero** verificación completa (Parte 3) — confirma que nada se rompió

---

## Archivos que se MODIFICAN (máximo 4)

| Archivo | Cambio |
|---------|--------|
| `src/types/game.types.ts` | Agregar `levelRequired?: number` a `InventoryItem` |
| `src/game/loot.ts` | Agregar `levelRequired` al objeto retornado |
| `src/utils/smartLoot.ts` | Agregar `levelRequired` al objeto retornado (si aplica) |
| Archivos con warnings de ESLint | Eliminar condicionales redundantes (sin cambiar lógica) |

## Archivos que NO se tocan bajo ninguna circunstancia

- `src/engine/combat.ts` (motor — corazón del juego)
- `src/data/gameData.ts` (balance de skills)
- `src/data/items/*.ts` (stats de items)
- `src/game/config.ts` (balance de clases)
- `src/game/combat-config.ts` (constantes de combate)
- `src/components/combat/CombatScreen.tsx` (solo fix de tipos si aplica)
- `index.html`, `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`
- `package.json` (NO se instalan dependencias nuevas)

---

*Plan generado el 2026-09-15. Ejecutar sin desviaciones.*
