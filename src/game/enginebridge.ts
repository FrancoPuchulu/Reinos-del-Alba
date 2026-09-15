// src/game/enginebridge.ts

export interface BattleEntity {
  name: string;
  className: string;
  maxHp: number;
  currentHp: number;
  level: number;
  isBoss?: boolean;
  affixes?: EnemyAffix[];
  abilities: {
    id: string;
    name: string;
    currentCharges: number;
    maxCharges: number;
  }[];
  ultimateCharge: number;
  ultimateSkill?: Skill | null;
}

export interface BattleState {
  player: BattleEntity;
  enemy: BattleEntity;
  combatLog: string[];
  isBattleOver: boolean;
  winner: 'player' | 'enemy' | null;
  potions: {
    pocionVida: number;
    pocionMana: number;
  };
  playerStatuses: StatusInstance[];
  enemyStatuses: StatusInstance[];
  ultimateSkill: Skill | null;
  enemyUltimateCharge?: number;
}

export interface CombatResult {
  engineState: CombatState;
  uiState: BattleState;
}

import {
  createCombatState,
  processTurn,
  createPlayerActor,
  createEnemy
} from '../engine/combat';
import type { CombatState, CombatAction, EnemyAbility, StatusInstance, EnemyAffix } from '../types/combat';
import type { Skill } from '../types/game.types';

export class EngineBridge {
  public static startNewBattle(playerData: {
    id?: string;
    name: string;
    clase?: string;
    race?: string;
    level?: number;
    stats: Record<string, number>;
    weaponDamage?: { min: number; max: number };
    habilidades?: Array<{
      id: string;
      nombre: string;
      cargas: number;
      cargasMaximas: number;
    }>;
    fullSkills?: Skill[];
    equipmentEffects?: string[];
    hpMod?: number;
  }, enemyData: {
    id?: string;
    name: string;
    clase?: string;
    level?: number;
    stats: Record<string, number>;
    maxHp?: number;
    hp?: number;
    abilities?: EnemyAbility[];
    isBoss?: boolean;
    affixes?: EnemyAffix[];
  }, initialPotions?: { pocionVida: number; pocionMana: number }, ultimateSkill?: Skill | null, enemyUltimateSkill?: Skill | null): CombatResult {
    const playerActor = createPlayerActor(
      playerData.id ?? 'player',
      playerData.name,
      playerData.stats,
      playerData.weaponDamage ?? { min: 5, max: 10 },
      playerData.level ?? 1,
      playerData.equipmentEffects,
      playerData.hpMod,
    );

    const enemyActor = createEnemy(
      enemyData.id ?? 'enemy',
      enemyData.name,
      enemyData.level ?? 1,
      enemyData.stats,
      enemyData.abilities ?? [],
      enemyData.isBoss
    );
    enemyActor.affixes = enemyData.affixes;
    if (enemyUltimateSkill) {
      enemyActor.ultimateSkill = enemyUltimateSkill;
    }

    const combatType = enemyUltimateSkill ? 'pvp' : 'pve';
    const engineState = createCombatState([playerActor], [enemyActor], combatType);

    const uiState: BattleState = {
      player: {
        name: playerData.name,
        className: playerData.clase ?? 'Guerrero',
        maxHp: playerActor.maxHp,
        currentHp: playerActor.currentHp,
        level: playerData.level ?? 1,
        isBoss: false,
        abilities: playerData.habilidades ? playerData.habilidades.map((h) => ({
          id: h.id,
          name: h.nombre,
          currentCharges: h.cargas,
          maxCharges: h.cargasMaximas,
        })) : [],
        ultimateCharge: 0,
      },
      enemy: {
        name: enemyData.name,
        className: enemyData.clase ?? 'Enemigo',
        maxHp: enemyActor.maxHp,
        currentHp: enemyActor.currentHp,
        level: enemyData.level ?? 1,
        isBoss: enemyData.isBoss,
        affixes: enemyActor.affixes,
        abilities: [],
        ultimateCharge: 0,
        ultimateSkill: enemyUltimateSkill ?? null,
      },
      combatLog: ['¡Un encuentro gótico ha comenzado!'],
      isBattleOver: false,
      winner: null,
      potions: initialPotions ?? {
        pocionVida: 2,
        pocionMana: 2
      },
      playerStatuses: [],
      enemyStatuses: [],
      ultimateSkill: ultimateSkill ?? null,
    };

    return { engineState, uiState };
  }

  public static selectAction(engineState: CombatState, uiState: BattleState, abilityIndex: number): CombatResult {
    const playerAction: CombatAction = {
      type: 'skill',
      sourceId: engineState.allies[0].id,
      targetIds: ['enemy_1'],
      abilityId: uiState.player.abilities[abilityIndex]?.id
    };

    const newEngine = processTurn(engineState, playerAction);

    const newUi = structuredClone(uiState);

    const updatedPlayer = newEngine.allies[0];
    const updatedEnemy = newEngine.enemies[0];

    newUi.player.currentHp = updatedPlayer.currentHp;
    newUi.enemy.currentHp = updatedEnemy.currentHp;

    const playerActorId = newEngine.allies[0]?.id ?? 'player';
    const enemyActorId = newEngine.enemies[0]?.id ?? 'enemy';
    newUi.playerStatuses = newEngine.statuses.allies[playerActorId] ?? [];
    newUi.enemyStatuses = newEngine.statuses.enemies[enemyActorId] ?? [];

    const newLogs = newEngine.log.filter(
      entry => !newUi.combatLog.includes(entry.message)
    );
    for (const entry of newLogs) {
      newUi.combatLog.push(entry.message);
    }

    if (playerAction.type === 'skill') {
      const current = newUi.player.abilities[abilityIndex].currentCharges;
      newUi.player.abilities[abilityIndex].currentCharges = Math.max(0, current - 1);
    }

    if (newEngine.phase === 'victory' || newEngine.phase === 'defeat') {
      newUi.isBattleOver = true;
      newUi.winner = newEngine.phase === 'victory' ? 'player' : 'enemy';
      newUi.combatLog.push(
        newUi.winner === 'player' ? '¡Has ganado el combate!' : 'Has sido derrotado...'
      );
    }

    newUi.enemyUltimateCharge = newEngine.enemyUltimateCharge ?? 0;

    return { engineState: newEngine, uiState: newUi };
  }

  public static consumeItem(engineState: CombatState, uiState: BattleState, itemType: string): CombatResult {
    if (uiState.isBattleOver) {
      throw new Error("El combate ya ha terminado.");
    }

    if (itemType === 'pocion-vida' && uiState.potions.pocionVida <= 0) {
      throw new Error("No quedan pociones de vida.");
    }
    if (itemType === 'pocion-mana' && uiState.potions.pocionMana <= 0) {
      throw new Error("No quedan pociones de maná.");
    }

    const itemAction: CombatAction = {
      type: 'item',
      sourceId: engineState.allies[0].id,
      targetIds: ['ally_1'],
      abilityId: itemType
    };

    const newEngine = processTurn(engineState, itemAction);

    const newUi = structuredClone(uiState);

    if (itemType === 'pocion-vida') {
      newUi.potions = {
        ...newUi.potions,
        pocionVida: newUi.potions.pocionVida - 1
      };
    } else if (itemType === 'pocion-mana') {
      newUi.potions = {
        ...newUi.potions,
        pocionMana: newUi.potions.pocionMana - 1
      };
      newUi.player.abilities = newUi.player.abilities.map(a => ({
        ...a,
        currentCharges: a.maxCharges,
      }));
    }

    const updatedPlayer = newEngine.allies[0];
    newUi.player.currentHp = updatedPlayer.currentHp;

    const playerActorId = newEngine.allies[0]?.id ?? 'player';
    const enemyActorId = newEngine.enemies[0]?.id ?? 'enemy';
    newUi.playerStatuses = newEngine.statuses.allies[playerActorId] ?? [];
    newUi.enemyStatuses = newEngine.statuses.enemies[enemyActorId] ?? [];

    const newLogs = newEngine.log.filter(
      entry => !newUi.combatLog.includes(entry.message)
    );
    for (const entry of newLogs) {
      newUi.combatLog.push(entry.message);
    }

    if (newEngine.phase === 'victory' || newEngine.phase === 'defeat') {
      newUi.isBattleOver = true;
      newUi.winner = newEngine.phase === 'victory' ? 'player' : 'enemy';
      newUi.combatLog.push(
        newUi.winner === 'player' ? '¡Has ganado el combate!' : 'Has sido derrotado...'
      );
    }

    newUi.enemyUltimateCharge = newEngine.enemyUltimateCharge ?? 0;

    return { engineState: newEngine, uiState: newUi };
  }
}
