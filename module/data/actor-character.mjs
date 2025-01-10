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
    /* Derived Abilities Values */
    const defenseMeleeBonus = Math.max(Math.floor((this.abilities.agi.totalBonus + this.abilities.int.totalBonus)/ 2),0);
    const defenseRangedBonus = Math.max(Math.floor((this.abilities.qui.totalBonus + this.abilities.int.totalBonus)/ 2),0);
    const fatigueBonus = Math.max(Math.floor((this.abilities.end.totalBonus + this.abilities.wil.totalBonus)/ 2),0);
    const initiativeBonus = Math.max(Math.floor((this.abilities.qui.totalBonus + this.abilities.int.totalBonus)/ 2),0) + 1;
    const paceBonus = Math.max(Math.floor((this.abilities.agi.totalBonus + this.abilities.qui.totalBonus)/ 2),0) + 2;
    const stabilityBonus = Math.max(Math.floor((this.abilities.end.totalBonus + this.abilities.wil.totalBonus)/ 2),0);

    this.derivedAbilityValues = {
      dfm: {
        bonusMod: defenseMeleeBonus,
        totalBonus: defenseMeleeBonus
      },
      dfr: {
        bonusMod: defenseRangedBonus,
        totalBonus: defenseRangedBonus
      },
      ftm: {
        bonusMod: fatigueBonus,
        totalBonus: fatigueBonus
      },
      ini: {
        bonusMod: initiativeBonus,
        totalBonus: initiativeBonus
      },
      pce: {
        bonusMod: paceBonus,
        totalBonus: paceBonus
      },
      sta: {
        bonusMod: stabilityBonus,
        totalBonus: stabilityBonus
      }
    }

    /* Derived Ability Pools */
    const cyberneticCalc = 0;
    const faithCalc = Math.max(Math.floor((this.abilities.wil.totalBonus + this.abilities.int.totalBonus)/ 2),0);
    const healthCalc = Math.max(Math.floor((this.abilities.end.totalBonus + this.abilities.wil.totalBonus)/ 2),0);
    const manaCalc = Math.max(Math.floor((this.abilities.wil.totalBonus + this.abilities.rea.totalBonus)/ 2),0);
    const psychicCalc = Math.max(Math.floor((this.abilities.wil.totalBonus + this.abilities.pre.totalBonus)/ 2),0);
    const paceDieCalc = Math.max(Math.floor((this.abilities.agi.totalBonus + this.abilities.qui.totalBonus)/ 2),0);

    /* Calc Cybernetic Pool based on Installed Limbs */
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

    /* store the totals... */
    this.derivedAbilityPools = {
      cyb: {
        die: "d0",
        calc: cyberneticCalc,
        currentDie: "d0"
      },
      fth: {
        die: faithDie,
        calc: faithCalc,
        currentDie: faithDie
      },
      hlt: {
        die: healthDie,
        calc: healthCalc,
        currentDie: healthDie
      },
      man: {
        die: manaDie,
        calc: manaCalc,
        currentDie: manaDie
      },
      psy: {
        die: psychicDie,
        calc: psychicCalc,
        currentDie: psychicDie
      },
      pcd: {
        die: paceDie,
        calc: paceDieCalc,
        currentDie: paceDie
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