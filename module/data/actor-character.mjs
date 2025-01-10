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

    /* Hindrance Mods */
    /* we are processing hindrances before derived attributes because they _can_ modify derived attributes */
    if(this.effects && this.effects.dav) {
      Object.keys(this.effects.dav).forEach((effect) => {
        console.log("Processing Effect", effect);
        Object.keys(this.effects.dav[effect]).forEach((key) => {
          console.log("Processing Key", key);
          Object.keys(this.effects.dav[effect][key]).forEach((subKey) => {
            console.log("Processing SubKey", subKey);
            if(subKey === 'hindranceMod') {
              this.derivedAbilityValues[key][subKey] = Math.min(this.derivedAbilityValues[key].hindranceMod, this.effects.dav[effect][key][subKey]);
            } else {
              this.derivedAbilityValues[key][subKey] = Math.max(this.derivedAbilityValues[key].hindranceMod, this.effects.dav[effect][key][subKey]);
            }            
          })
        })
      })
    }
    if(this.effects && this.effects.dap) {
      Object.keys(this.effects.dap).forEach((effect) => {
        console.log("Processing Effect", effect);
        Object.keys(this.effects.dap[effect]).forEach((key) => {
          console.log("Processing Key", key);
          Object.keys(this.effects.dap[effect][key]).forEach((subKey) => {
            console.log("Processing SubKey", subKey);
            if(subKey === 'hindranceMod') {
              this.derivedAbilityPools[key][subKey] = Math.min(this.derivedAbilityPools[key].hindranceMod, this.effects.dap[effect][key][subKey]);
            } else {
              this.derivedAbilityPools[key][subKey] = Math.max(this.derivedAbilityPools[key].hindranceMod, this.effects.dap[effect][key][subKey]);
            }            
          })
        })
      })
    }

    //`system.effects.<name>.<ability>.<mod>` //Now
    //`system.effects.dap.<name>.<ability>.<mod>` //Purposed
    //`system.effects.dav.<name>.<ability>.<mod>`
    //`system.effects.skl.<name>.<ability>.<mod>`

    /* Derived Abilities Values */
    const defenseMeleeBonus = Math.max(Math.floor((this.abilities.agility.totalBonus + this.abilities.intuition.totalBonus)/ 2),0);
    const defenseRangedBonus = Math.max(Math.floor((this.abilities.quickness.totalBonus + this.abilities.intuition.totalBonus)/ 2),0);
    const fatigueBonus = Math.max(Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2),0);
    const initiativeBonus = Math.max(Math.floor((this.abilities.quickness.totalBonus + this.abilities.intuition.totalBonus)/ 2),0) + 1;
    const paceBonus = Math.max(Math.floor((this.abilities.agility.totalBonus + this.abilities.quickness.totalBonus)/ 2),0) + 2;
    const stabilityBonus = Math.max(Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2),0);

    const defenseMeleeHindrance = this.derivedAbilityValues.defenseMelee.hindranceMod;
    const defenseRangedHindrance = this.derivedAbilityValues.defenseRanged.hindranceMod;
    const fatigueHindrance = this.derivedAbilityValues.fatigueMaximum.hindranceMod;
    const initiativeHindrance = this.derivedAbilityValues.initiativeSpeed.hindranceMod;
    const paceHindrance = this.derivedAbilityValues.pace.hindranceMod;
    const stabilityHindrance = this.derivedAbilityValues.stability.hindranceMod;
    
    this.derivedAbilityValues = {
      defenseMelee: {
        bonusMod: defenseMeleeBonus,
        hindranceMod: defenseMeleeHindrance,
        totalBonus: defenseMeleeBonus + defenseMeleeHindrance,
      },
      defenseRanged: {
        bonusMod: defenseRangedBonus,
        hindranceMod: defenseRangedHindrance,
        totalBonus: defenseRangedBonus + defenseRangedHindrance,
      },
      fatigueMaximum: {
        bonusMod: fatigueBonus,
        hindranceMod: fatigueHindrance,
        totalBonus: fatigueBonus + fatigueHindrance,
      },
      initiativeSpeed: {
        bonusMod: initiativeBonus,
        hindranceMod: initiativeHindrance,
        totalBonus: initiativeBonus + initiativeHindrance,
      },
      pace: {
        bonusMod: paceBonus,
        hindranceMod: paceHindrance,
        totalBonus: paceBonus + paceHindrance,
      },
      stability: {
        bonusMod: stabilityBonus,
        hindranceMod: stabilityHindrance,
        totalBonus: Math.max(stabilityBonus + stabilityHindrance,0)
      }
    }
    console.log("Preparing Derived Data for Character -- 2", this);

    /* Derived Ability Pools */
    const cyberneticCalc = 0;
    const faithCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.intuition.totalBonus)/ 2) + this.derivedAbilityPools.faithPool.hindranceMod
    const healthCalc = Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2) + this.derivedAbilityPools.healthPool.hindranceMod
    const manaCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.reasoning.totalBonus)/ 2) + this.derivedAbilityPools.manaPool.hindranceMod
    const psychicCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.presence.totalBonus)/ 2) + this.derivedAbilityPools.psychicPool.hindranceMod
    const paceDieCalc = Math.floor((this.abilities.agility.totalBonus + this.abilities.quickness.totalBonus)/ 2) + this.derivedAbilityPools.paceDie.hindranceMod

    /* Calc Cybernetic Pool based on Installed Limbs */
    let cyberneticDie = "d0";
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
      }
    }
    console.log("Preparing Derived Data for Character -- 3", this);
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