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
  paceDie: 'SENTIUS_RPG.DerivedAbilityPool.PaceDie.long',
  resourcePool: 'SENTIUS_RPG.DerivedAbilityPool.ResourcePool.long'
}

SENTIUS_RPG.derivedAbilityPoolAbbreviations = {
  cyberneticPool: 'SENTIUS_RPG.DerivedAbilityPool.CyberneticPool.abbr',
  faithPool: 'SENTIUS_RPG.DerivedAbilityPool.FaithPool.abbr',
  healthPool: 'SENTIUS_RPG.DerivedAbilityPool.HealthPool.abbr',
  manaPool: 'SENTIUS_RPG.DerivedAbilityPool.ManaPool.abbr',
  psychicPool: 'SENTIUS_RPG.DerivedAbilityPool.PsychicPool.abbr',
  paceDie: 'SENTIUS_RPG.DerivedAbilityPool.PaceDie.abbr',
  resourcePool: 'SENTIUS_RPG.DerivedAbilityPool.ResourcePool.abbr'
}

/* The set of Skills used within the system. */

SENTIUS_RPG.skills = {
  animalHandling: 'SENTIUS_RPG.Skill.AnimalHandling.long',
  athletics: 'SENTIUS_RPG.Skill.Athletics.long',
  combatFirearms: 'SENTIUS_RPG.Skill.CombatFirearms.long',
  combatGunnery: 'SENTIUS_RPG.Skill.CombatGunnery.long',
  combatMelee: 'SENTIUS_RPG.Skill.CombatMelee.long',
  combatMissile: 'SENTIUS_RPG.Skill.CombatMissile.long',
  computers: 'SENTIUS_RPG.Skill.Computers.long',
  demolitions: 'SENTIUS_RPG.Skill.Demolitions.long',
  disguise: 'SENTIUS_RPG.Skill.Disguise.long',
  drive: 'SENTIUS_RPG.Skill.Drive.long',
  history: 'SENTIUS_RPG.Skill.History.long',
  intimidation: 'SENTIUS_RPG.Skill.Intimidation.long',
  locksTrapsElectronic: 'SENTIUS_RPG.Skill.LocksTrapsElectronic.long',
  locksTrapsMechanical: 'SENTIUS_RPG.Skill.LocksTrapsMechanical.long',
  medicine: 'SENTIUS_RPG.Skill.Medicine.long',
  perception: 'SENTIUS_RPG.Skill.Perception.long',
  performance: 'SENTIUS_RPG.Skill.Performance.long',
  persuasion: 'SENTIUS_RPG.Skill.Persuasion.long',
  pilot:  'SENTIUS_RPG.Skill.Pilot.long',
  repair: 'SENTIUS_RPG.Skill.Repair.long',
  resistanceDiscipline: 'SENTIUS_RPG.Skill.ResistanceDiscipline.long',
  resistanceMagic: 'SENTIUS_RPG.Skill.ResistanceMagic.long',
  resistancePoison: 'SENTIUS_RPG.Skill.ResistancePoison.long',
  resistanceReflex: 'SENTIUS_RPG.Skill.ResistanceReflex.long',
  resistanceStamina: 'SENTIUS_RPG.Skill.ResistanceStamina.long',
  stealth: 'SENTIUS_RPG.Skill.Stealth.long',
  survival: 'SENTIUS_RPG.Skill.Survival.long',
  technicalBiological: 'SENTIUS_RPG.Skill.TechnicalBiological.long',
  technicalCybernetics: 'SENTIUS_RPG.Skill.TechnicalCybernetics.long',
  technicalElectronic: 'SENTIUS_RPG.Skill.TechnicalElectronic.long',
  technicalMechanical: 'SENTIUS_RPG.Skill.TechnicalMechanical.long',
  technicalPower: 'SENTIUS_RPG.Skill.TechnicalPower.long',
  technicalSoftware: 'SENTIUS_RPG.Skill.TechnicalSoftware.long'
}

SENTIUS_RPG.skillsAbbreviations = {
  animalHandling: 'SENTIUS_RPG.Skill.AnimalHandling.abbr',
  athletics: 'SENTIUS_RPG.Skill.Athletics.abbr',
  combatFirearms: 'SENTIUS_RPG.Skill.CombatFirearms.abbr',
  combatGunnery: 'SENTIUS_RPG.Skill.CombatGunnery.abbr',
  combatMelee: 'SENTIUS_RPG.Skill.CombatMelee.abbr',
  combatMissile: 'SENTIUS_RPG.Skill.CombatMissile.abbr',
  computers: 'SENTIUS_RPG.Skill.Computers.abbr',
  demolitions: 'SENTIUS_RPG.Skill.Demolitions.abbr',
  disguise: 'SENTIUS_RPG.Skill.Disguise.abbr',
  drive: 'SENTIUS_RPG.Skill.Drive.abbr',
  history: 'SENTIUS_RPG.Skill.History.abbr',
  intimidation: 'SENTIUS_RPG.Skill.Intimidation.abbr',
  locksTrapsElectronic: 'SENTIUS_RPG.Skill.LocksTrapsElectronic.abbr',
  locksTrapsMechanical: 'SENTIUS_RPG.Skill.LocksTrapsMechanical.abbr',
  medicine: 'SENTIUS_RPG.Skill.Medicine.abbr',
  perception: 'SENTIUS_RPG.Skill.Perception.abbr',
  performance: 'SENTIUS_RPG.Skill.Performance.abbr',
  persuasion: 'SENTIUS_RPG.Skill.Persuasion.abbr',
  pilot:  'SENTIUS_RPG.Skill.Pilot.abbr',
  repair: 'SENTIUS_RPG.Skill.Repair.abbr',
  resistanceDiscipline: 'SENTIUS_RPG.Skill.ResistanceDiscipline.abbr',
  resistanceMagic: 'SENTIUS_RPG.Skill.ResistanceMagic.abbr',
  resistanceReflex: 'SENTIUS_RPG.Skill.ResistanceReflex.abbr',
  resistanceStamina: 'SENTIUS_RPG.Skill.ResistanceStamina.abbr',
  stealth: 'SENTIUS_RPG.Skill.Stealth.abbr',
  survival: 'SENTIUS_RPG.Skill.Survival.abbr',
  technicalBiological: 'SENTIUS_RPG.Skill.TechnicalBiological.abbr',
  technicalCybernetics: 'SENTIUS_RPG.Skill.TechnicalCybernetics.abbr',
  technicalElectronic: 'SENTIUS_RPG.Skill.TechnicalElectronic.abbr',
  technicalMechanical: 'SENTIUS_RPG.Skill.TechnicalMechanical.abbr',
  technicalPower: 'SENTIUS_RPG.Skill.TechnicalPower.abbr',
  technicalSoftware: 'SENTIUS_RPG.Skill.TechnicalSoftware.abbr'
}
