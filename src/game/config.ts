// --- CONFIGURACIÓN CENTRAL DE ATRIBUTOS BASE (VERDAD ÚNICA) ---

export const BASE_STATS_RAZAS = {
  Humano:    { fuerza: 10, agilidad: 10, inteligencia: 10, vitalidad: 10 },
  Orco:      { fuerza: 14, agilidad: 8,  inteligencia: 6,  vitalidad: 12 },
  NoMuerto:  { fuerza: 9,  agilidad: 11, inteligencia: 12, vitalidad: 8 },
  Minotauro: { fuerza: 15, agilidad: 6,  inteligencia: 5,  vitalidad: 14 },
  Goblin:    { fuerza: 7,  agilidad: 14, inteligencia: 9,  vitalidad: 10 },
  Enano:     { fuerza: 12, agilidad: 8,  inteligencia: 8,  vitalidad: 12 },
  Gnomo:     { fuerza: 6,  agilidad: 12, inteligencia: 14, vitalidad: 8 },
  AltoElfo:  { fuerza: 8,  agilidad: 10, inteligencia: 15, vitalidad: 7 }
};

export const BASE_STATS_CLASES = {
  Guerrero: { hpMod: 1.5, mpMod: 0.5, damageType: 'fuerza', fuerza: 18, agilidad: 10, inteligencia: 7, vitalidad: 15, armadura: 10, regenMana: 1 },
  Mago:     { hpMod: 0.8, mpMod: 2.0, damageType: 'inteligencia', fuerza: 7, agilidad: 10, inteligencia: 18, vitalidad: 12, armadura: 3, regenMana: 8 },
  Druida:   { hpMod: 1.2, mpMod: 1.2, damageType: 'inteligencia', fuerza: 15, agilidad: 10, inteligencia: 14, vitalidad: 13, armadura: 6, regenMana: 6 },
  Brujo:    { hpMod: 1.1, mpMod: 1.1, damageType: 'inteligencia', fuerza: 15, agilidad: 10, inteligencia: 16, vitalidad: 10, armadura: 5, regenMana: 6, roboVida: 5 }
};
