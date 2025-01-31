export const SENTIUS_RPG = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
SENTIUS_RPG.abilities = {
  agility: 'SENTIUS_RPG.Ability.Agility.long',
  endurance: 'SENTIUS_RPG.Ability.Endurance.long',
  quickness: 'SENTIUS_RPG.Ability.Quickness.long',
  strength: 'SENTIUS_RPG.Ability.Strength.long',
  intuition: 'SENTIUS_RPG.Ability.Intuition.long',
  presence: 'SENTIUS_RPG.Ability.Presence.long',
  reasoning: 'SENTIUS_RPG.Ability.Reasoning.long',
  willpower: 'SENTIUS_RPG.Ability.Willpower.long'
};

SENTIUS_RPG.abilityAbbreviations = {
  agility: 'SENTIUS_RPG.Ability.Agility.abbr',
  endurance: 'SENTIUS_RPG.Ability.Endurance.abbr',
  quickness: 'SENTIUS_RPG.Ability.Quickness.abbr',
  strength: 'SENTIUS_RPG.Ability.Strength.abbr',
  intuition: 'SENTIUS_RPG.Ability.Intuition.abbr',
  presence: 'SENTIUS_RPG.Ability.Presence.abbr',
  reasoning: 'SENTIUS_RPG.Ability.Reasoning.abbr',
  willpower: 'SENTIUS_RPG.Ability.Willpower.abbr'
};

SENTIUS_RPG.derivedAbilityValues = {
  defenseMelee: 'SENTIUS_RPG.DerivedAbilityValue.DefenseMelee.long',
  defenseRanged: 'SENTIUS_RPG.DerivedAbilityValue.DefenseRanged.long',
  fatigueMaximum: 'SENTIUS_RPG.DerivedAbilityValue.FatigueMaximum.long',
  pace: 'SENTIUS_RPG.DerivedAbilityValue.Pace.long',
  stability: 'SENTIUS_RPG.DerivedAbilityValue.Stability.long'
}

SENTIUS_RPG.derivedAbilityValueAbbreviations = {
  defenseMelee: 'SENTIUS_RPG.DerivedAbilityValue.DefenseMelee.abbr',
  defenseRanged: 'SENTIUS_RPG.DerivedAbilityValue.DefenseRanged.abbr',
  fatigueMaximum: 'SENTIUS_RPG.DerivedAbilityValue.FatigueMaximum.abbr',
  pace: 'SENTIUS_RPG.DerivedAbilityValue.Pace.abbr',
  stability: 'SENTIUS_RPG.DerivedAbilityValue.Stability.abbr'
}

SENTIUS_RPG.derivedAbilityPools = {
  cyberneticPool: 'SENTIUS_RPG.DerivedAbilityPool.CyberneticPool.long',
  faithPool: 'SENTIUS_RPG.DerivedAbilityPool.FaithPool.long',
  gritDie: 'SENTIUS_RPG.DerivedAbilityPool.GritDie.long',
  healthPool: 'SENTIUS_RPG.DerivedAbilityPool.HealthPool.long',
  initiativeDie: 'SENTIUS_RPG.DerivedAbilityPool.InitiativeDie.long',
  manaPool: 'SENTIUS_RPG.DerivedAbilityPool.ManaPool.long',
  psychicPool: 'SENTIUS_RPG.DerivedAbilityPool.PsychicPool.long',
  paceDie: 'SENTIUS_RPG.DerivedAbilityPool.PaceDie.long',
  resourcePool: 'SENTIUS_RPG.DerivedAbilityPool.ResourcePool.long'
}

SENTIUS_RPG.derivedAbilityPoolAbbreviations = {
  cyberneticPool: 'SENTIUS_RPG.DerivedAbilityPool.CyberneticPool.abbr',
  faithPool: 'SENTIUS_RPG.DerivedAbilityPool.FaithPool.abbr',
  gritDie: 'SENTIUS_RPG.DerivedAbilityPool.GritDie.abbr',
  healthPool: 'SENTIUS_RPG.DerivedAbilityPool.HealthPool.abbr',
  initiativeDie: 'SENTIUS_RPG.DerivedAbilityPool.InitiativeDie.abbr',
  manaPool: 'SENTIUS_RPG.DerivedAbilityPool.ManaPool.abbr',
  psychicPool: 'SENTIUS_RPG.DerivedAbilityPool.PsychicPool.abbr',
  paceDie: 'SENTIUS_RPG.DerivedAbilityPool.PaceDie.abbr',
  resourcePool: 'SENTIUS_RPG.DerivedAbilityPool.ResourcePool.abbr'
}

/* The set of Skills used within the system. */
SENTIUS_RPG.skills = {
  animalHandling: 'SENTIUS_RPG.Skill.AnimalHandling.long',
  artifice: 'SENTIUS_RPG.Skill.Artifice.long',
  athletics: 'SENTIUS_RPG.Skill.Athletics.long',
  combatBow: 'SENTIUS_RPG.Skill.CombatBow.long',
  combatFirearms: 'SENTIUS_RPG.Skill.CombatFirearms.long',
  combatGunnery: 'SENTIUS_RPG.Skill.CombatGunnery.long',
  combatMelee: 'SENTIUS_RPG.Skill.CombatMelee.long',
  demolitions: 'SENTIUS_RPG.Skill.Demolitions.long',
  deception: 'SENTIUS_RPG.Skill.Deception.long',
  disguise: 'SENTIUS_RPG.Skill.Disguise.long',
  drive: 'SENTIUS_RPG.Skill.Drive.long',
  hacking: 'SENTIUS_RPG.Skill.Hacking.long',
  history: 'SENTIUS_RPG.Skill.History.long',
  intimidation: 'SENTIUS_RPG.Skill.Intimidation.long',
  juryrigging: 'SENTIUS_RPG.Skill.Jury-Rigging.long',
  locksTrapsElectronic: 'SENTIUS_RPG.Skill.LocksTrapsElectronic.long',
  locksTrapsMechanical: 'SENTIUS_RPG.Skill.LocksTrapsMechanical.long',
  medicine: 'SENTIUS_RPG.Skill.Medicine.long',
  networking: 'SENTIUS_RPG.Skill.Networking.long',
  perception: 'SENTIUS_RPG.Skill.Perception.long',
  performance: 'SENTIUS_RPG.Skill.Performance.long',
  persuasion: 'SENTIUS_RPG.Skill.Persuasion.long',
  pilot:  'SENTIUS_RPG.Skill.Pilot.long',
  repair: 'SENTIUS_RPG.Skill.Repair.long',
  resistanceBiological: 'SENTIUS_RPG.Skill.ResistanceBiological.long',
  resistanceDiscipline: 'SENTIUS_RPG.Skill.ResistanceDiscipline.long',
  resistanceMagic: 'SENTIUS_RPG.Skill.ResistanceMagic.long',
  resistancePhysical: 'SENTIUS_RPG.Skill.ResistancePhysical.long',
  scavenging: 'SENTIUS_RPG.Skill.Scavenging.long',
  stealth: 'SENTIUS_RPG.Skill.Stealth.long',
  survival: 'SENTIUS_RPG.Skill.Survival.long',
  technicalBiological: 'SENTIUS_RPG.Skill.TechnicalBiological.long',
  technicalCybernetics: 'SENTIUS_RPG.Skill.TechnicalCybernetics.long',
  technicalElectronic: 'SENTIUS_RPG.Skill.TechnicalElectronic.long',
  technicalMechanical: 'SENTIUS_RPG.Skill.TechnicalMechanical.long',
  technicalMysticalPower: 'SENTIUS_RPG.Skill.TechnicalMysticalPower.long',
  technicalSoftware: 'SENTIUS_RPG.Skill.TechnicalSoftware.long',
  xenobiology: 'SENTIUS_RPG.Skill.Xenobiology.long',
}

SENTIUS_RPG.skillsAbbreviations = {
  animalHandling: 'SENTIUS_RPG.Skill.AnimalHandling.abbr',
  artifice: 'SENTIUS_RPG.Skill.Artifice.abbr',
  athletics: 'SENTIUS_RPG.Skill.Athletics.abbr',
  combatBow: 'SENTIUS_RPG.Skill.CombatBow.abbr',
  combatFirearms: 'SENTIUS_RPG.Skill.CombatFirearms.abbr',
  combatGunnery: 'SENTIUS_RPG.Skill.CombatGunnery.abbr',
  combatMelee: 'SENTIUS_RPG.Skill.CombatMelee.abbr',
  demolitions: 'SENTIUS_RPG.Skill.Demolitions.abbr',
  deception: 'SENTIUS_RPG.Skill.Deception.abbr',
  disguise: 'SENTIUS_RPG.Skill.Disguise.abbr',
  drive: 'SENTIUS_RPG.Skill.Drive.abbr',
  hacking: 'SENTIUS_RPG.Skill.Hacking.abbr',
  history: 'SENTIUS_RPG.Skill.History.abbr',
  intimidation: 'SENTIUS_RPG.Skill.Intimidation.abbr',
  juryrigging: 'SENTIUS_RPG.Skill.Jury-Rigging.abbr',
  locksTrapsElectronic: 'SENTIUS_RPG.Skill.LocksTrapsElectronic.abbr',
  locksTrapsMechanical: 'SENTIUS_RPG.Skill.LocksTrapsMechanical.abbr',
  medicine: 'SENTIUS_RPG.Skill.Medicine.abbr',
  networking: 'SENTIUS_RPG.Skill.Networking.abbr',
  perception: 'SENTIUS_RPG.Skill.Perception.abbr',
  performance: 'SENTIUS_RPG.Skill.Performance.abbr',
  persuasion: 'SENTIUS_RPG.Skill.Persuasion.abbr',
  pilot:  'SENTIUS_RPG.Skill.Pilot.abbr',
  repair: 'SENTIUS_RPG.Skill.Repair.abbr',
  resistanceBiological: 'SENTIUS_RPG.Skill.ResistanceBiological.abbr',
  resistanceDiscipline: 'SENTIUS_RPG.Skill.ResistanceDiscipline.abbr',
  resistanceMagic: 'SENTIUS_RPG.Skill.ResistanceMagic.abbr',
  resistancePhysical: 'SENTIUS_RPG.Skill.ResistancePhysical.abbr',
  scavenging: 'SENTIUS_RPG.Skill.Scavenging.abbr',
  stealth: 'SENTIUS_RPG.Skill.Stealth.abbr',
  survival: 'SENTIUS_RPG.Skill.Survival.abbr',
  technicalBiological: 'SENTIUS_RPG.Skill.TechnicalBiological.abbr',
  technicalCybernetics: 'SENTIUS_RPG.Skill.TechnicalCybernetics.abbr',
  technicalElectronic: 'SENTIUS_RPG.Skill.TechnicalElectronic.abbr',
  technicalMechanical: 'SENTIUS_RPG.Skill.TechnicalMechanical.abbr',
  technicalMysticalPower: 'SENTIUS_RPG.Skill.TechnicalMysticalPower.abbr',
  technicalSoftware: 'SENTIUS_RPG.Skill.TechnicalSoftware.abbr',
  xenobiology: 'SENTIUS_RPG.Skill.Xenobiology.abbr',
}

/* The set of Action Words used within the system. */
SENTIUS_RPG.actionWords = {
  armor: 'SENTIUS_RPG.ActionWord.Armor.long',
  banish: 'SENTIUS_RPG.ActionWord.Banish.long',
  control: 'SENTIUS_RPG.ActionWord.Control.long',
  create: 'SENTIUS_RPG.ActionWord.Create.long',
  destroy: 'SENTIUS_RPG.ActionWord.Destroy.long',
  repair: 'SENTIUS_RPG.ActionWord.Repair.long',
  shield: 'SENTIUS_RPG.ActionWord.Shield.long',
  summon: 'SENTIUS_RPG.ActionWord.Summon.long',
  transform: 'SENTIUS_RPG.ActionWord.Transform.long',
}

SENTIUS_RPG.actionWordsAbbreviations = {
  armor: 'SENTIUS_RPG.ActionWord.Armor.abbr',
  banish: 'SENTIUS_RPG.ActionWord.Banish.abbr',
  control: 'SENTIUS_RPG.ActionWord.Control.abbr',
  create: 'SENTIUS_RPG.ActionWord.Create.abbr',
  destroy: 'SENTIUS_RPG.ActionWord.Destroy.abbr',
  repair: 'SENTIUS_RPG.ActionWord.Repair.abbr',
  shield: 'SENTIUS_RPG.ActionWord.Shield.abbr',
  summon: 'SENTIUS_RPG.ActionWord.Summon.abbr',
  transform: 'SENTIUS_RPG.ActionWord.Transform.abbr',
}

/* The set of Power Words used within the system. */
SENTIUS_RPG.powerWords = {
  air: 'SENTIUS_RPG.PowerWord.Air.long',
  animal: 'SENTIUS_RPG.PowerWord.Animal.long',
  dark: 'SENTIUS_RPG.PowerWord.Dark.long',
  earth: 'SENTIUS_RPG.PowerWord.Earth.long',
  fire: 'SENTIUS_RPG.PowerWord.Fire.long',
  force: 'SENTIUS_RPG.PowerWord.Force.long',
  light: 'SENTIUS_RPG.PowerWord.Light.long',
  plant: 'SENTIUS_RPG.PowerWord.Plant.long',
  spirit: 'SENTIUS_RPG.PowerWord.Spirit.long',
  water: 'SENTIUS_RPG.PowerWord.Water.long',
}

SENTIUS_RPG.powerWordsAbbreviations = {
  air: 'SENTIUS_RPG.PowerWord.Air.abbr',
  animal: 'SENTIUS_RPG.PowerWord.Animal.abbr',
  dark: 'SENTIUS_RPG.PowerWord.Dark.abbr',
  earth: 'SENTIUS_RPG.PowerWord.Earth.abbr',
  fire: 'SENTIUS_RPG.PowerWord.Fire.abbr',
  force: 'SENTIUS_RPG.PowerWord.Force.abbr',
  light: 'SENTIUS_RPG.PowerWord.Light.abbr',
  plant: 'SENTIUS_RPG.PowerWord.Plant.abbr',
  spirit: 'SENTIUS_RPG.PowerWord.Spirit.abbr',
  water: 'SENTIUS_RPG.PowerWord.Water.abbr',
}

/* The set of Target Words used within the system. */
SENTIUS_RPG.targetWords = {
  it: 'SENTIUS_RPG.TargetWord.It.long',
  me: 'SENTIUS_RPG.TargetWord.Me.long',
  them: 'SENTIUS_RPG.TargetWord.Them.long',
  there: 'SENTIUS_RPG.TargetWord.There.long',
  us: 'SENTIUS_RPG.TargetWord.Us.long',
  you: 'SENTIUS_RPG.TargetWord.You.long',
}

SENTIUS_RPG.targetWordsAbbreviations = {
  it: 'SENTIUS_RPG.TargetWord.It.abbr',
  me: 'SENTIUS_RPG.TargetWord.Me.abbr',
  them: 'SENTIUS_RPG.TargetWord.Them.abbr',
  there: 'SENTIUS_RPG.TargetWord.There.abbr',
  us: 'SENTIUS_RPG.TargetWord.Us.abbr',
  you: 'SENTIUS_RPG.TargetWord.You.abbr',
}

SENTIUS_RPG.psychic = {
  confusion: 'SENTIUS_RPG.Psychic.Confusion.long',
  charm: 'SENTIUS_RPG.Psychic.Charm.long',
  dominate: 'SENTIUS_RPG.Psychic.Dominate.long',
  locatepower: 'SENTIUS_RPG.Psychic.LocatePower.long',
  locatething: 'SENTIUS_RPG.Psychic.LocateThing.long',
  locateperson: 'SENTIUS_RPG.Psychic.LocatePerson.long',
  drainrecharge: 'SENTIUS_RPG.Psychic.DrainRecharge.long',
  throwelectrical: 'SENTIUS_RPG.Psychic.ThrowElectrical.long',
  shieldelectrical: 'SENTIUS_RPG.Psychic.ShieldElectrical.long',
  calmemotions: 'SENTIUS_RPG.Psychic.CalmEmotions.long',
  bolsteremotions: 'SENTIUS_RPG.Psychic.BolsterEmotions.long',
  healing: 'SENTIUS_RPG.Psychic.Healing.long',
  createevaporatewater: 'SENTIUS_RPG.Psychic.CreateEvaporateWater.long',
  throwwater: 'SENTIUS_RPG.Psychic.ThrowWater.long',
  engulf: 'SENTIUS_RPG.Psychic.Engulf.long',
  illusion: 'SENTIUS_RPG.Psychic.Illusion.long',
  wipe: 'SENTIUS_RPG.Psychic.Wipe.long',
  modify: 'SENTIUS_RPG.Psychic.Modify.long',
  light: 'SENTIUS_RPG.Psychic.Light.long',
  projectblades: 'SENTIUS_RPG.Psychic.ProjectBlades.long',
  projectpain: 'SENTIUS_RPG.Psychic.ProjectPain.long',
  controlfires: 'SENTIUS_RPG.Psychic.ControlFires.long',
  throwfire: 'SENTIUS_RPG.Psychic.ThrowFire.long',
  shieldfire: 'SENTIUS_RPG.Psychic.ShieldFire.long',
  throwobject: 'SENTIUS_RPG.Psychic.ThrowObject.long',
  shieldkinetic: 'SENTIUS_RPG.Psychic.ShieldKinetic.long',
  flight: 'SENTIUS_RPG.Psychic.Flight.long',
  understandlanguages: 'SENTIUS_RPG.Psychic.UnderstandLanguages.long',
  reading: 'SENTIUS_RPG.Psychic.Reading.long',
  talking: 'SENTIUS_RPG.Psychic.Talking.long',
}

SENTIUS_RPG.psychicAbbreviations = {
  confusion: 'SENTIUS_RPG.Psychic.Confusion.abbr',
  charm: 'SENTIUS_RPG.Psychic.Charm.abbr',
  dominate: 'SENTIUS_RPG.Psychic.Dominate.abbr',
  locatepower: 'SENTIUS_RPG.Psychic.LocatePower.abbr',
  locatething: 'SENTIUS_RPG.Psychic.LocateThing.abbr',
  locateperson: 'SENTIUS_RPG.Psychic.LocatePerson.abbr',
  drainrecharge: 'SENTIUS_RPG.Psychic.DrainRecharge.abbr',
  throwelectrical: 'SENTIUS_RPG.Psychic.ThrowElectrical.abbr',
  shieldelectrical: 'SENTIUS_RPG.Psychic.ShieldElectrical.abbr',
  calmemotions: 'SENTIUS_RPG.Psychic.CalmEmotions.abbr',
  bolsteremotions: 'SENTIUS_RPG.Psychic.BolsterEmotions.abbr',
  healing: 'SENTIUS_RPG.Psychic.Healing.abbr',
  createevaporatewater: 'SENTIUS_RPG.Psychic.CreateEvaporateWater.abbr',
  throwwater: 'SENTIUS_RPG.Psychic.ThrowWater.abbr',
  engulf: 'SENTIUS_RPG.Psychic.Engulf.abbr',
  illusion: 'SENTIUS_RPG.Psychic.Illusion.abbr',
  wipe: 'SENTIUS_RPG.Psychic.Wipe.abbr',
  modify: 'SENTIUS_RPG.Psychic.Modify.abbr',
  light: 'SENTIUS_RPG.Psychic.Light.abbr',
  projectblades: 'SENTIUS_RPG.Psychic.ProjectBlades.abbr',
  projectpain: 'SENTIUS_RPG.Psychic.ProjectPain.abbr',
  controlfires: 'SENTIUS_RPG.Psychic.ControlFires.abbr',
  throwfire: 'SENTIUS_RPG.Psychic.ThrowFire.abbr',
  shieldfire: 'SENTIUS_RPG.Psychic.ShieldFire.abbr',
  throwobject: 'SENTIUS_RPG.Psychic.ThrowObject.abbr',
  shieldkinetic: 'SENTIUS_RPG.Psychic.ShieldKinetic.abbr',
  flight: 'SENTIUS_RPG.Psychic.Flight.abbr',
  understandlanguages: 'SENTIUS_RPG.Psychic.UnderstandLanguages.abbr',
  reading: 'SENTIUS_RPG.Psychic.Reading.abbr',
  talking: 'SENTIUS_RPG.Psychic.Talking.abbr',
}

Handlebars.registerHelper('capitalizeFirst', function(word) {
  if (typeof word !== 'string') return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
});