export const SENTIUS_RPG = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
SENTIUS_RPG.abilities = {
  //physical
  agility: 'SENTIUS_RPG.Ability.Agility.long',
  endurance: 'SENTIUS_RPG.Ability.Endurance.long',
  quickness: 'SENTIUS_RPG.Ability.Quickness.long',
  strength: 'SENTIUS_RPG.Ability.Strength.long',
  //mental
  intuition: 'SENTIUS_RPG.Ability.Intuition.long',
  presence: 'SENTIUS_RPG.Ability.Presence.long',
  reasoning: 'SENTIUS_RPG.Ability.Reasoning.long',
  willpower: 'SENTIUS_RPG.Ability.Willpower.long'
};

SENTIUS_RPG.abilityAbbreviations = {
  //physical
  agility: 'SENTIUS_RPG.Ability.Agility.abbr',
  endurance: 'SENTIUS_RPG.Ability.Endurance.abbr',
  quickness: 'SENTIUS_RPG.Ability.Quickness.abbr',
  strength: 'SENTIUS_RPG.Ability.Strength.abbr',
  //mental
  intuition: 'SENTIUS_RPG.Ability.Intuition.abbr',
  presence: 'SENTIUS_RPG.Ability.Presence.abbr',
  reasoning: 'SENTIUS_RPG.Ability.Reasoning.abbr',
  willpower: 'SENTIUS_RPG.Ability.Willpower.abbr'
};

SENTIUS_RPG.derivedAbilityValues = {
  defenseMelee: 'SENTIUS_RPG.DerivedAbilityValue.DefenseMelee.long',
  defenseRanged: 'SENTIUS_RPG.DerivedAbilityValue.DefenseRanged.long',
  fatigueMaximum: 'SENTIUS_RPG.DerivedAbilityValue.FatigueMaximum.long',
  initiativeSpeed: 'SENTIUS_RPG.DerivedAbilityValue.InitiativeSpeed.long',
  pace: 'SENTIUS_RPG.DerivedAbilityValue.Pace.long',
  stability: 'SENTIUS_RPG.DerivedAbilityValue.Stability.long'
}

SENTIUS_RPG.derivedAbilityValueAbbreviations = {
  defenseMelee: 'SENTIUS_RPG.DerivedAbilityValue.DefenseMelee.abbr',
  defenseRanged: 'SENTIUS_RPG.DerivedAbilityValue.DefenseRanged.abbr',
  fatigueMaximum: 'SENTIUS_RPG.DerivedAbilityValue.FatigueMaximum.abbr',
  initiativeSpeed: 'SENTIUS_RPG.DerivedAbilityValue.InitiativeSpeed.abbr',
  pace: 'SENTIUS_RPG.DerivedAbilityValue.Pace.abbr',
  stability: 'SENTIUS_RPG.DerivedAbilityValue.Stability.abbr'
}

SENTIUS_RPG.derivedAbilityPools = {
  cyberneticPool: 'SENTIUS_RPG.DerivedAbilityPool.CyberneticPool.long',
  faithPool: 'SENTIUS_RPG.DerivedAbilityPool.FaithPool.long',
  healthPool: 'SENTIUS_RPG.DerivedAbilityPool.HealthPool.long',
  manaPool: 'SENTIUS_RPG.DerivedAbilityPool.ManaPool.long',
  psychicPool: 'SENTIUS_RPG.DerivedAbilityPool.PsychicPool.long',
  paceDie: 'SENTIUS_RPG.DerivedAbilityPool.PaceDie.long'
}

SENTIUS_RPG.derivedAbilityPoolAbbreviations = {
  cyberneticPool: 'SENTIUS_RPG.DerivedAbilityPool.CyberneticPool.abbr',
  faithPool: 'SENTIUS_RPG.DerivedAbilityPool.FaithPool.abbr',
  healthPool: 'SENTIUS_RPG.DerivedAbilityPool.HealthPool.abbr',
  manaPool: 'SENTIUS_RPG.DerivedAbilityPool.ManaPool.abbr',
  psychicPool: 'SENTIUS_RPG.DerivedAbilityPool.PsychicPool.abbr',
  paceDie: 'SENTIUS_RPG.DerivedAbilityPool.PaceDie.abbr'
}