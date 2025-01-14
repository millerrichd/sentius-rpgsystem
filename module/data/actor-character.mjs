import SentiusRPGActorBase from "./base-actor.mjs";

export default class SentiusRPGCharacter extends SentiusRPGActorBase {

  /* -------------------------------------------- 
  MAIN DATA MODEL
  -------------------------------------------- */

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        die: new fields.StringField({ required: true, initial: "d10" }),
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
      });
      return obj;
    }, {}));

    // Iterate over derived ability values and create a new SchemaField for each.
    schema.derivedAbilityValues = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.derivedAbilityValues).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
      });
      return obj;
    }, {}));

    // Iterate over derived ability pools and create a new SchemaField for each.
    schema.derivedAbilityPools = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.derivedAbilityPools).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        die: new fields.StringField({ required: true, initial: "d4" }),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        calc: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
        currentDie: new fields.StringField({ required: true, initial: "" })
      });
      return obj;
    }, {}));

    // Iterate over skills and create a new SchemaField for each.
    schema.skills = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.skills).reduce((obj, skill) => {
      let attr1 = 'agility';
      let attr2 = 'quickness';
      if (skill === 'animalHandling') {
        attr1 = 'agility';
        attr2 = 'quickness';
      } else if (skill === 'athletics') {
        attr1 = 'agility';
        attr2 = 'strength';
      } else if (skill === 'combatBow') {
        attr1 = 'agility';
        attr2 = 'intuition';
      } else if (skill === 'combatFirearm') {
        attr1 = 'agility';
        attr2 = 'intuition';
      } else if (skill === 'combatGunnery') {
        attr1 = 'agility';
        attr2 = 'reasoning';
      } else if (skill === 'combatMelee') {
        attr1 = 'agility';
        attr2 = 'strength';
      } else if (skill === 'computers') {
        attr1 = 'reasoning';
        attr2 = 'willpower';        
      } else if (skill === 'deception') {
        attr1 = 'intuition';
        attr2 = 'presence';
      } else if (skill === 'demolitions') {
        attr1 = 'agility';
        attr2 = 'intuition';
      } else if (skill === 'disguise') {
        attr1 = 'agility';
        attr2 = 'presence';
      } else if (skill === 'drive') {
        attr1 = 'intuition';
        attr2 = 'quickness';
      } else if (skill === 'history') {
        attr1 = 'reasoning';
        attr2 = 'willpower';
      } else if (skill === 'intimidation') {
        attr1 = 'presence';
        attr2 = 'strength';
      } else if (skill === 'locksTrapsElectronic') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'locksTrapsMechanical') {
        attr1 = 'agility';
        attr2 = 'reasoning';
      } else if (skill === 'medicine') {
        attr1 = 'agility';
        attr2 = 'intuition';
      } else if (skill === 'perception') {
        attr1 = 'intuition';
        attr2 = 'willpower';
      } else if (skill === 'performance') {
        attr1 = 'intuition';
        attr2 = 'presence';
      } else if (skill === 'persuasion') {
        attr1 = 'intuition';
        attr2 = 'presence';
      } else if (skill === 'pilot') {
        attr1 = 'intuition';
        attr2 = 'quickness';
      } else if (skill === 'repair') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'resistanceDiscipline') {
        attr1 = 'presence';
        attr2 = 'willpower';
      } else if (skill === 'resistanceMagic') {
        attr1 = 'reasoning';
        attr2 = 'willpower';
      } else if (skill === 'resistancePoison') {
        attr1 = 'endurance';
        attr2 = 'willpower';
      } else if (skill === 'resistanceReflex') {
        attr1 = 'agility';
        attr2 = 'quickness';
      } else if (skill === 'resistanceStamina') {
        attr1 = 'endurance';
        attr2 = 'strength';
      } else if (skill === 'stealth') {
        attr1 = 'agility';
        attr2 = 'intuition';
      } else if (skill === 'survival') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'technicalBiological') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'technicalCybernetics') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'technicalElectronic') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'technicalMechanical') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'technicalPower') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'technicalSoftware') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      }

      obj[skill] = new fields.SchemaField({
        attr1: new fields.StringField({ required: true, initial: attr1 }),
        attr2: new fields.StringField({ required: true, initial: attr2 }),
        trainingStatus: new fields.StringField({ required: true, initial: "untrained" }),
        die: new fields.StringField({ required: true, initial: "d12" }),
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
        usageTick: new fields.BooleanField({ required: true, initial: false }),
        isNegBonus: new fields.BooleanField({ required: true, initial: false }),
        maxTrainingStatus: new fields.StringField({ required: true, initial: "Untrained" }),
      });
      return obj;
    }, {}));

    // return the schema finally
    return schema;
  }

  /*
  --------------------------------------------
  DERIVED DATA
  --------------------------------------------
  */

  prepareDerivedData() {
    console.log("Preparing Derived Data for Character", this);

    /* Hindrance Mods, Trait Mods, CyberMods, BioMods */
    /* we are processing MODS before derived attributes because they _can_ modify derived attributes */
    if(this.effects && this.effects.dav) {
      Object.keys(this.effects.dav).forEach((effect) => {
        // console.log("Processing Effect", effect);
        Object.keys(this.effects.dav[effect]).forEach((key) => {
          // console.log("Processing Key", key);
          Object.keys(this.effects.dav[effect][key]).forEach((subKey) => {
            // console.log("Processing SubKey", subKey);
            if(subKey === 'hindranceMod') {
              this.derivedAbilityValues[key][subKey] = Math.min(this.derivedAbilityValues[key][subKey], this.effects.dav[effect][key][subKey]);
            } else {
              this.derivedAbilityValues[key][subKey] = Math.max(this.derivedAbilityValues[key][subKey], this.effects.dav[effect][key][subKey]);
            }            
          })
        })
      })
    }
    if(this.effects && this.effects.dap) {
      Object.keys(this.effects.dap).forEach((effect) => {
        // console.log("Processing Effect", effect);
        Object.keys(this.effects.dap[effect]).forEach((key) => {
          // console.log("Processing Key", key);
          Object.keys(this.effects.dap[effect][key]).forEach((subKey) => {
            // console.log("Processing SubKey", subKey);
            if(subKey === 'hindranceMod') {
              this.derivedAbilityPools[key][subKey] = Math.min(this.derivedAbilityPools[key][subKey], this.effects.dap[effect][key][subKey]);
            } else {
              this.derivedAbilityPools[key][subKey] = Math.max(this.derivedAbilityPools[key][subKey], this.effects.dap[effect][key][subKey]);
            }
          })
        })
      })
    }
    if(this.effects && this.effects.skl) {
      Object.keys(this.effects.skl).forEach((effect) => {
        // console.log("Processing Effect", effect);
        Object.keys(this.effects.skl[effect]).forEach((key) => {
          // console.log("Processing Key", key);
          Object.keys(this.effects.skl[effect][key]).forEach((subKey) => {
            // console.log("Processing SubKey", subKey);
            if(subKey === 'hindranceMod') {
              this.skills[key][subKey] = Math.min(this.skills[key][subKey], this.effects.skl[effect][key][subKey]);
            } else {
              this.skills[key][subKey] = Math.max(this.skills[key][subKey], this.effects.skl[effect][key][subKey]);
            }            
          })
        })
      })
    }

    console.log("POST HINDRANCE TRAIT", this);
    
    /* Derived Abilities Values */
    const defenseMeleeBonus = Math.max(Math.floor((this.abilities.agility.totalBonus + this.abilities.intuition.totalBonus)/ 2),0);
    const defenseRangedBonus = Math.max(Math.floor((this.abilities.quickness.totalBonus + this.abilities.intuition.totalBonus)/ 2),0);
    const fatigueBonus = Math.max(Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2),0) + 1;
    const initiativeBonus = Math.max(Math.floor((this.abilities.quickness.totalBonus + this.abilities.intuition.totalBonus)/ 2),0) + 1;
    const paceBonus = Math.max(Math.floor((this.abilities.agility.totalBonus + this.abilities.quickness.totalBonus)/ 2),0) + 2;
    const stabilityBonus = Math.max(Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2),0);

    const defenseMeleeHindrance = this.derivedAbilityValues.defenseMelee.hindranceMod;
    const defenseMeleeTrait = this.derivedAbilityValues.defenseMelee.traitMod;
    const defenseRangedHindrance = this.derivedAbilityValues.defenseRanged.hindranceMod;
    const defenseRangedTrait = this.derivedAbilityValues.defenseRanged.traitMod;
    const fatigueHindrance = this.derivedAbilityValues.fatigueMaximum.hindranceMod;
    const fatigueTrait = this.derivedAbilityValues.fatigueMaximum.traitMod;
    const initiativeHindrance = this.derivedAbilityValues.initiativeSpeed.hindranceMod;
    const initiativeTrait = this.derivedAbilityValues.initiativeSpeed.traitMod;
    const paceHindrance = this.derivedAbilityValues.pace.hindranceMod;
    const paceTrait = this.derivedAbilityValues.pace.traitMod;
    const stabilityHindrance = this.derivedAbilityValues.stability.hindranceMod;
    const stabilityTrait = this.derivedAbilityValues.stability.traitMod;
    
    this.derivedAbilityValues = {
      defenseMelee: {
        bonusMod: defenseMeleeBonus,
        hindranceMod: defenseMeleeHindrance,
        traitMod: defenseMeleeTrait,
        totalBonus: defenseMeleeBonus + defenseMeleeHindrance + defenseMeleeTrait,
      },
      defenseRanged: {
        bonusMod: defenseRangedBonus,
        hindranceMod: defenseRangedHindrance,
        traitMod: defenseRangedTrait,
        totalBonus: defenseRangedBonus + defenseRangedHindrance + defenseRangedTrait,
      },
      fatigueMaximum: {
        bonusMod: fatigueBonus,
        hindranceMod: fatigueHindrance,
        traitMod: fatigueTrait,
        totalBonus: fatigueBonus + fatigueHindrance + fatigueTrait,
      },
      initiativeSpeed: {
        bonusMod: initiativeBonus,
        hindranceMod: initiativeHindrance,
        traitMod: initiativeTrait,
        totalBonus: initiativeBonus + initiativeHindrance + initiativeTrait,
      },
      pace: {
        bonusMod: paceBonus,
        hindranceMod: paceHindrance,
        traitMod: paceTrait,
        totalBonus: paceBonus + paceHindrance + paceTrait,
      },
      stability: {
        bonusMod: stabilityBonus,
        hindranceMod: stabilityHindrance,
        traitMod: stabilityTrait,
        totalBonus: Math.max((stabilityBonus + stabilityHindrance + stabilityTrait),0)
      }
    }
    console.log("Preparing Derived Data for Character -- 2", this);

    /* Derived Ability Pools */
    const cyberneticCalc = 0;
    const resourceCalc = 2 + this.derivedAbilityPools.resourcePool.traitMod;
    const faithCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.intuition.totalBonus)/ 2) + this.derivedAbilityPools.faithPool.hindranceMod + this.derivedAbilityPools.faithPool.traitMod;
    const healthCalc = Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2) + this.derivedAbilityPools.healthPool.hindranceMod + this.derivedAbilityPools.healthPool.traitMod;
    const manaCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.reasoning.totalBonus)/ 2) + this.derivedAbilityPools.manaPool.hindranceMod + this.derivedAbilityPools.manaPool.traitMod;
    const psychicCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.presence.totalBonus)/ 2) + this.derivedAbilityPools.psychicPool.hindranceMod + this.derivedAbilityPools.psychicPool.traitMod;
    const paceDieCalc = Math.floor((this.abilities.agility.totalBonus + this.abilities.quickness.totalBonus)/ 2) + this.derivedAbilityPools.paceDie.hindranceMod + this.derivedAbilityPools.paceDie.traitMod;

    /* Calc Cybernetic Pool based on Installed Limbs */
    let cyberneticDie = "d0";
    let resourceDie = "";
    console.log("Resource Calc", resourceCalc);
    if (resourceCalc < 3) {
      resourceDie = "d4";
    } else if (resourceCalc < 5) {
      resourceDie = "d6";
    } else if (resourceCalc < 7) {
      resourceDie = "d8";
    } else if (resourceCalc < 9) {
      resourceDie = "d10";
    } else {
      resourceDie = "d12";
    }
    console.log("Resource Die", resourceDie);
    /* Calc Faith Pool */
    let faithDie = "";
    if (faithCalc < 3) {
      faithDie = "d4";
    } else if (faithCalc < 5) {
      faithDie = "d6";
    } else if (faithCalc < 7) {
      faithDie = "d8";
    } else if (faithCalc < 9) {
      faithDie = "d10";
    } else {
      faithDie = "d12";
    }
    /* Calc Health Pool */
    let healthDie = "";
    if (healthCalc < 3) {
      healthDie = "d4";
    } else if (healthCalc < 5) {
      healthDie = "d6";
    } else if (healthCalc < 7) {
      healthDie = "d8";
    } else if (healthCalc < 9) {
      healthDie = "d10";
    } else {
      healthDie = "d12";
    }
    /* Calc Mana Pool */
    let manaDie = "";
    if (manaCalc < 3) {
      manaDie = "d4";
    } else if (manaCalc < 5) {
      manaDie = "d6";
    } else if (manaCalc < 7) {
      manaDie = "d8";
    } else if (manaCalc < 9) {
      manaDie = "d10";
    } else {
      manaDie = "d12";
    }
    /* Calc Psychic Pool */
    let psychicDie = "";
    if (psychicCalc < 3) {
      psychicDie = "d4";
    } else if (psychicCalc < 5) {
      psychicDie = "d6";
    } else if (psychicCalc < 7) {
      psychicDie = "d8";
    } else if (psychicCalc < 9) {
      psychicDie = "d10";
    } else {
      psychicDie = "d12";
    }
    /* Calc Pace Pool */
    let paceDie = "";
    if (paceDieCalc < 3) {
      paceDie = "d4";
    } else if (paceDieCalc < 5) {
      paceDie = "d6";
    } else if (paceDieCalc < 7) {
      paceDie = "d8";
    } else if (paceDieCalc < 9) {
      paceDie = "d10";
    } else {
      paceDie = "d12";
    }

    /* we need to dynamically figure out if the pools current die is empty of not */
    let cybCurrentDie = ''
    if(this.derivedAbilityPools.cyberneticPool.currentDie === '') {
      cybCurrentDie = cyberneticDie
    } else {
      cybCurrentDie = this.derivedAbilityPools.cyberneticPool.currentDie
    }
    let fthCurrentDie = ''
    if(this.derivedAbilityPools.faithPool.currentDie === '') {
      fthCurrentDie = faithDie
    } else {
      fthCurrentDie = this.derivedAbilityPools.faithPool.currentDie
    }
    let hltCurrentDie = ''
    if(this.derivedAbilityPools.healthPool.currentDie === '') {
      hltCurrentDie = healthDie
    } else {
      hltCurrentDie = this.derivedAbilityPools.healthPool.currentDie
    }
    let manCurrentDie = ''
    if(this.derivedAbilityPools.manaPool.currentDie === '') {
      manCurrentDie = manaDie
    } else {
      manCurrentDie = this.derivedAbilityPools.manaPool.currentDie
    }
    let psyCurrentDie = ''
    if(this.derivedAbilityPools.psychicPool.currentDie === '') {
      psyCurrentDie = psychicDie
    } else {
      psyCurrentDie = this.derivedAbilityPools.psychicPool.currentDie
    }
    let rscCurrentDie = ''
    console.log("Resource Die Current", this.derivedAbilityPools.resourcePool.currentDie);
    if(this.derivedAbilityPools.resourcePool.currentDie === '') {
      rscCurrentDie = resourceDie
    } else {
      rscCurrentDie = this.derivedAbilityPools.resourcePool.currentDie
    }

    /* store the totals... */
    this.derivedAbilityPools = {
      cyberneticPool: {
        die: "d0",
        calc: cyberneticCalc,
        currentDie: cybCurrentDie
      },
      faithPool: {
        die: faithDie,
        calc: faithCalc,
        currentDie: fthCurrentDie
      },
      healthPool: {
        die: healthDie,
        calc: healthCalc,
        currentDie: hltCurrentDie
      },
      manaPool: {
        die: manaDie,
        calc: manaCalc,
        currentDie: manCurrentDie
      },
      psychicPool: {
        die: psychicDie,
        calc: psychicCalc,
        currentDie: psyCurrentDie
      },
      paceDie: {
        die: paceDie,
        calc: paceDieCalc,
        currentDie: paceDie
      },
      resourcePool: {
        die: resourceDie,
        calc: resourceCalc,
        currentDie: rscCurrentDie
      }
    }
    console.log("Preparing Derived Data for Character -- 3", this);

    /* Skills */
    // Setting the training status for each skill
    const skills = this.skills
    for (let skill in skills) {
      if (Object.prototype.hasOwnProperty.call(skills, skill)) {
        // console.log("PROCESSING", skill, skills[skill].attr1, skills[skill].attr2);
        const die1 = this.abilities[skills[skill].attr1].die;
        const die2 = this.abilities[skills[skill].attr2].die;
        const mapping = {
          "d12": 0,
          "d10": 1,
          "d8": 2,
          "d6": 3,
          "d4": 4,
          "d2": 5
        }
        const maxDie = Math.max(mapping[die1], mapping[die2]);

        let training = 'Untrained'
        if(maxDie === 0) {
          training = 'Untrained';
        } else if (maxDie === 1) {
          training = 'Apprentice';
        } else if (maxDie === 2) {
          training = 'Professional';
        } else if (maxDie === 3) {
          training = 'Expert';
        } else if (maxDie === 4) {
          training = 'Master';
        } else { 
          training = 'Legendary';
        }
        // console.log("SKILL", skill, "MAX TRAINING LEVEL", training);
        skills[skill].maxTrainingStatus = training;
        const totalBonus = skills[skill].bonusMod + skills[skill].hindranceMod + skills[skill].traitMod + skills[skill].cyberMod + skills[skill].bioMod;
        skills[skill].totalBonus = totalBonus;
        if (totalBonus < 0) {
          skills[skill].isNegBase = true;
        } else {
          skills[skill].isNegBase = false;
        }
      }
    }

  }

  /*
  --------------------------------------------
  ROLL DATA
  --------------------------------------------
  */

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}