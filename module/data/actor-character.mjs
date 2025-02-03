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
      console.log("SETUP OF DERIVED ABILITY VALUES", ability);
      obj[ability] = new fields.SchemaField({
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20})
      });
      return obj;
    }, {}));
    schema.curStability = new fields.NumberField({ ...requiredInteger, initial: -99, min: -99, max: 20});
    schema.cyberneticCount = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12});
    schema.bioneticCount = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12});

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
      } else if (skill === 'artifice') {
        attr1 = 'reasoning';
        attr2 = 'willpower';
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
      } else if (skill === 'hacking') {
        attr1 = 'reasoning';
        attr2 = 'willpower';        
      } else if (skill === 'history') {
        attr1 = 'reasoning';
        attr2 = 'willpower';
      } else if (skill === 'intimidation') {
        attr1 = 'presence';
        attr2 = 'strength';
      } else if (skill === 'juryrigging') {
        attr1 = 'quickness';
        attr2 = 'reasoning';
      } else if (skill === 'locksTrapsElectronic') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
      } else if (skill === 'locksTrapsMechanical') {
        attr1 = 'agility';
        attr2 = 'reasoning';
      } else if (skill === 'medicine') {
        attr1 = 'agility';
        attr2 = 'intuition';
      } else if (skill === 'networking') {
        attr1 = 'intuition';
        attr2 = 'presence';
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
      } else if (skill === 'resistanceBiological') {
        attr1 = 'endurance';
        attr2 = 'willpower';
      } else if (skill === 'resistanceDiscipline') {
        attr1 = 'presence';
        attr2 = 'willpower';
      } else if (skill === 'resistanceMagic') {
        attr1 = 'reasoning';
        attr2 = 'willpower';
      } else if (skill === 'resistancePhysical') {
        attr1 = 'agility';
        attr2 = 'endurance';
      } else if (skill === 'scavenging') {
        attr1 = 'intuition';
        attr2 = 'reasoning';
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
      } else if (skill === 'xenobilogoy') {
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
        isNegBonus: new fields.BooleanField({ required: true, initial: false }),
        maxTrainingStatus: new fields.StringField({ required: true, initial: "Untrained" }),
        usageTickSucc0: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc1: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc2: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc3: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc4: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc5: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc6: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc7: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc8: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc9: new fields.BooleanField({ required: true, initial: false }),
      });
      return obj;
    }, {}));

    // Iterate over the magic words: action, power, target
    schema.actionWords = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.actionWords).reduce((obj, word) => {
      obj[word] = new fields.SchemaField({
        attr1: new fields.StringField({ required: true, initial: "intuition" }),
        attr2: new fields.StringField({ required: true, initial: "reasoning" }),
        trainingStatus: new fields.StringField({ required: true, initial: "untrained" }),
        die: new fields.StringField({ required: true, initial: "d12" }),
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
        isNegBonus: new fields.BooleanField({ required: true, initial: false }),
        maxTrainingStatus: new fields.StringField({ required: true, initial: "Untrained" }),
        usageTickSucc0: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc1: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc2: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc3: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc4: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc5: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc6: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc7: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc8: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc9: new fields.BooleanField({ required: true, initial: false }),
        hideShow: new fields.StringField({ initial: "none" }),
        rotate: new fields.StringField({ initial: "fa-caret-right" }),
      });
      return obj;
    }, {}));
    schema.powerWords = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.powerWords).reduce((obj, word) => {
      obj[word] = new fields.SchemaField({
        attr1: new fields.StringField({ required: true, initial: "intuition" }),
        attr2: new fields.StringField({ required: true, initial: "reasoning" }),
        trainingStatus: new fields.StringField({ required: true, initial: "untrained" }),
        die: new fields.StringField({ required: true, initial: "d12" }),
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
        isNegBonus: new fields.BooleanField({ required: true, initial: false }),
        maxTrainingStatus: new fields.StringField({ required: true, initial: "Untrained" }),
        usageTickSucc0: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc1: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc2: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc3: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc4: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc5: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc6: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc7: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc8: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc9: new fields.BooleanField({ required: true, initial: false }),
        hideShow: new fields.StringField({ initial: "none" }),
        rotate: new fields.StringField({ initial: "fa-caret-right" }),
      });
      return obj;
    }, {}));
    schema.targetWords = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.targetWords).reduce((obj, word) => {
      obj[word] = new fields.SchemaField({
        attr1: new fields.StringField({ required: true, initial: "intuition" }),
        attr2: new fields.StringField({ required: true, initial: "reasoning" }),
        trainingStatus: new fields.StringField({ required: true, initial: "untrained" }),
        die: new fields.StringField({ required: true, initial: "d12" }),
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
        isNegBonus: new fields.BooleanField({ required: true, initial: false }),
        maxTrainingStatus: new fields.StringField({ required: true, initial: "Untrained" }),
        usageTickSucc0: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc1: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc2: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc3: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc4: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc5: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc6: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc7: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc8: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc9: new fields.BooleanField({ required: true, initial: false }),
        hideShow: new fields.StringField({ initial: "none" }),
        rotate: new fields.StringField({ initial: "fa-caret-right" }),
      });
      return obj;
    }, {}));
    schema.currentWordSelection = new fields.SchemaField({
      actionWord: new fields.StringField({ required: true, initial: "armor" }),
      actionTotal: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      powerWord: new fields.StringField({ required: true, initial: "air" }),
      powerTotal: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      targetWord: new fields.StringField({ required: true, initial: "it" }),
      targetTotal: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandTotal: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandActionCost: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandManaChecks: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandLowestDie: new fields.StringField({ initial: "" }),
      grandLowestBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });
    schema.wordCosts = new fields.SchemaField({
      // Action Words
      wordArmor: new fields.SchemaField({
        costRating: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costType: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
      }),
      wordBanish: new fields.SchemaField({
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costSize: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      wordControl: new fields.SchemaField({
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
      }),
      wordCreate: new fields.SchemaField({
        costSize: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      wordDestroy: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costType: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
      }),
      wordRepair: new fields.SchemaField({
        costRepair: new fields.NumberField({ ...requiredInteger, initial: 10, min: 10 }),
        costSize: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 12, min: 12 }),
      }),
      wordShield: new fields.SchemaField({
        costResist: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
      }),
      wordSummon: new fields.SchemaField({
        costSize: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costStays: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
      }),
      wordTransform: new fields.SchemaField({
        costSize: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costMental: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      // Power Words
      wordAir: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),
      wordAnimal: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costAnimal: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      wordDark: new fields.SchemaField({
        costField: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
      }),
      wordEarth: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),
      wordFire: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),
      wordForce: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),
      wordLight: new fields.SchemaField({
        costField: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
      }),
      wordPlant: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costPlant: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      wordSpirit: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),
      wordWater: new fields.SchemaField({
        costDamage: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),

      // Target Words
      wordIt: new fields.SchemaField({
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
      }),
      wordMe: new fields.SchemaField({
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),
      wordThem: new fields.SchemaField({
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      wordThere: new fields.SchemaField({
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      wordUs: new fields.SchemaField({
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
      }),
      wordYou: new fields.SchemaField({
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      }),
    });

    // Iterate over the psychic powers
    schema.psychic = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.psychic).reduce((obj, word) => {
      obj[word] = new fields.SchemaField({
        attr1: new fields.StringField({ required: true, initial: "intuition" }),
        attr2: new fields.StringField({ required: true, initial: "presence" }),
        trainingStatus: new fields.StringField({ required: true, initial: "untrained" }),
        die: new fields.StringField({ required: true, initial: "d12" }),
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
        isNegBonus: new fields.BooleanField({ required: true, initial: false }),
        maxTrainingStatus: new fields.StringField({ required: true, initial: "Untrained" }),
        usageTickSucc0: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc1: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc2: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc3: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc4: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc5: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc6: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc7: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc8: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc9: new fields.BooleanField({ required: true, initial: false }),
        hideShow: new fields.StringField({ initial: "none" }),
        rotate: new fields.StringField({ initial: "fa-caret-right" }),
      });
      return obj;
    }, {}));
    
    schema.currentPsychicSelection = new fields.SchemaField({
      power: new fields.StringField({ required: true, initial: "confusion" }),
      grandTotal: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandActionCost: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandPsychicChecks: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandDie: new fields.StringField({ initial: "" }),
      grandBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });
    schema.psychicCosts = new fields.SchemaField({
      confusion: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 9, min: 1 }),
      }),
      charm: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      dominate: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 13, min: 1 }),
      }),
      locatepower: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 6, min: 1 }),
      }),
      locatething: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 7, min: 1 }),
      }),
      locateperson: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 10, min: 1 }),
      }),
      drainrecharge: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 8, min: 1 }),
      }),
      throwelectrical: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDamageDice: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamageNumber: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      shieldelectrical: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costArmorRating: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 8, min: 1 }),
      }),
      calmemotions: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 8, min: 1 }),
      }),
      bolsteremotions: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costCondition: new fields.NumberField({ ...requiredInteger, initial: 4, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 12, min: 1 }),
      }),
      healing: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costHeal: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 12, min: 1 }),
      }),
      createevaporatewater: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 8, min: 1 }),
      }),
      throwwater: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDamageDice: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamageNumber: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      engulf: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 12, min: 1 }),
      }),
      illusion: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 6, min: 6 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      wipe: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 6, min: 6 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costBack: new fields.NumberField({ ...requiredInteger, initial: 6, min: 6 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 18, min: 1 }),
      }),
      modify: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 12, min: 12 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costBack: new fields.NumberField({ ...requiredInteger, initial: 6, min: 6 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 24, min: 1 }),
      }),
      light: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costLight: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 7, min: 1 }),
      }),
      projectblade: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costWeapon: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDamageDice: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 9, min: 1 }),
      }),
      projectpain: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDamageDice: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamageNumber: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 14, min: 1 }),
      }),
      controlfires: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 10, min: 1 }),
      }),
      throwfire: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDamageDice: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamageNumber: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      shieldfire: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costArmorRating: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 8, min: 1 }),
      }),
      throwobject: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDamageDice: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamageNumber: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      shieldkinetic: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costArmorRating: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      flight: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costSpeed: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 12, min: 1 }),
      }),
      understandlanguages: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costUnderstand: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 7, min: 1 }),
      }),
      reading: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        costDigDeep: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 15, min: 1 }),
      }),
      talking: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 9, min: 9 }),
        costTarget: new fields.NumberField({ ...requiredInteger, initial: 3, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 13, min: 1 }),
      })
    });
    
    // Iterate over the totem aspects
    schema.totem = new fields.SchemaField(Object.keys(CONFIG.SENTIUS_RPG.totem).reduce((obj, aspect) => {
      obj[aspect] = new fields.SchemaField({
        attr1: new fields.StringField({ required: true, initial: "intuition" }),
        attr2: new fields.StringField({ required: true, initial: "willpower" }),
        trainingStatus: new fields.StringField({ required: true, initial: "untrained" }),
        die: new fields.StringField({ required: true, initial: "d12" }),
        bonusMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 12}),
        hindranceMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: -2, max: 0}),
        traitMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        cyberMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        bioMod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 2}),
        totalBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 20}),
        isNegBonus: new fields.BooleanField({ required: true, initial: false }),
        maxTrainingStatus: new fields.StringField({ required: true, initial: "Untrained" }),
        usageTickSucc0: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc1: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc2: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc3: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc4: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc5: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc6: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc7: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc8: new fields.BooleanField({ required: true, initial: false }),
        usageTickSucc9: new fields.BooleanField({ required: true, initial: false }),
        hideShow: new fields.StringField({ initial: "none" }),
        rotate: new fields.StringField({ initial: "fa-caret-right" }),
      });
      return obj;
    }, {}));
    
    schema.totemAnimals = new fields.SchemaField({
      bear: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "significant" }),
        bolstering: new fields.StringField({ required: true, initial: "significant" }),
        controlling: new fields.StringField({ required: true, initial: "moderate" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "moderate" }),
        healing: new fields.StringField({ required: true, initial: "grand" }),
        protective: new fields.StringField({ required: true, initial: "moderate" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "minor" }),
        transformation: new fields.StringField({ required: true, initial: "minor" }),
        skill1: new fields.StringField({ required: true, initial: "medicine" }),
        skill2: new fields.StringField({ required: true, initial: "resistanceBiological" }),
        skill3: new fields.StringField({ required: true, initial: "resistancePhysical" }),
        skill4: new fields.StringField({ required: true, initial: "survival" }),
      }),
      cat: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "moderate" }),
        bolstering: new fields.StringField({ required: true, initial: "grand" }),
        controlling: new fields.StringField({ required: true, initial: "significant" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "modearte" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "minor" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "significant" }),
        transformation: new fields.StringField({ required: true, initial: "moderate" }),
        skill1: new fields.StringField({ required: true, initial: "deception" }),
        skill2: new fields.StringField({ required: true, initial: "performance" }),
        skill3: new fields.StringField({ required: true, initial: "resistancePhysical" }),
        skill4: new fields.StringField({ required: true, initial: "stealth" }),
      }),
      coyote: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "moderate" }),
        bolstering: new fields.StringField({ required: true, initial: "significant" }),
        controlling: new fields.StringField({ required: true, initial: "moderate" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "minor" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "minor" }),
        reduction: new fields.StringField({ required: true, initial: "significant" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "grand" }),
        skill1: new fields.StringField({ required: true, initial: "deception" }),
        skill2: new fields.StringField({ required: true, initial: "disguise" }),
        skill3: new fields.StringField({ required: true, initial: "persuasion" }),
        skill4: new fields.StringField({ required: true, initial: "performance" }),
      }),
      dog: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "minor" }),
        bolstering: new fields.StringField({ required: true, initial: "moderate" }),
        controlling: new fields.StringField({ required: true, initial: "moderate" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "significant" }),
        healing: new fields.StringField({ required: true, initial: "significant" }),
        protective: new fields.StringField({ required: true, initial: "grand" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "minor" }),
        skill1: new fields.StringField({ required: true, initial: "combatMelee" }),
        skill2: new fields.StringField({ required: true, initial: "intimidation" }),
        skill3: new fields.StringField({ required: true, initial: "medicine" }),
        skill4: new fields.StringField({ required: true, initial: "perception" }),
      }),
      eagle: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "significant" }),
        bolstering: new fields.StringField({ required: true, initial: "minor" }),
        controlling: new fields.StringField({ required: true, initial: "significant" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "moderate" }),
        healing: new fields.StringField({ required: true, initial: "moderate" }),
        protective: new fields.StringField({ required: true, initial: "moderate" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "grand" }),
        transformation: new fields.StringField({ required: true, initial: "minor" }),
        skill1: new fields.StringField({ required: true, initial: "athletics" }),
        skill2: new fields.StringField({ required: true, initial: "combatBow" }),
        skill3: new fields.StringField({ required: true, initial: "perception" }),
        skill4: new fields.StringField({ required: true, initial: "resistancePhysical" }),
      }),
      lion: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "moderate" }),
        bolstering: new fields.StringField({ required: true, initial: "significant" }),
        controlling: new fields.StringField({ required: true, initial: "significant" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "grand" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "moderate" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "minor" }),
        skill1: new fields.StringField({ required: true, initial: "athletics" }),
        skill2: new fields.StringField({ required: true, initial: "combatMelee" }),
        skill3: new fields.StringField({ required: true, initial: "stealth" }),
        skill4: new fields.StringField({ required: true, initial: "survival" }),
      }),
      owl: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "grand" }),
        bolstering: new fields.StringField({ required: true, initial: "significant" }),
        controlling: new fields.StringField({ required: true, initial: "moderate" }),
        creation: new fields.StringField({ required: true, initial: "moderate" }),
        destructive: new fields.StringField({ required: true, initial: "significant" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "minor" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "minor" }),
        skill1: new fields.StringField({ required: true, initial: "history" }),
        skill2: new fields.StringField({ required: true, initial: "perception" }),
        skill3: new fields.StringField({ required: true, initial: "resistanceDiscipline" }),
        skill4: new fields.StringField({ required: true, initial: "stealth" }),
      }),
      raccoon: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "significant" }),
        bolstering: new fields.StringField({ required: true, initial: "minor" }),
        controlling: new fields.StringField({ required: true, initial: "moderate" }),
        creation: new fields.StringField({ required: true, initial: "grand" }),
        destructive: new fields.StringField({ required: true, initial: "minor" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "minor" }),
        reduction: new fields.StringField({ required: true, initial: "moderate" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "significant" }),
        skill1: new fields.StringField({ required: true, initial: "deception" }),
        skill2: new fields.StringField({ required: true, initial: "disguise" }),
        skill3: new fields.StringField({ required: true, initial: "locksTrapsMechanical" }),
        skill4: new fields.StringField({ required: true, initial: "perception" }),
      }),
      rat: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "minor" }),
        bolstering: new fields.StringField({ required: true, initial: "minor" }),
        controlling: new fields.StringField({ required: true, initial: "moderate" }),
        creation: new fields.StringField({ required: true, initial: "significant" }),
        destructive: new fields.StringField({ required: true, initial: "minor" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "moderate" }),
        reduction: new fields.StringField({ required: true, initial: "grand" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "significant" }),
        skill1: new fields.StringField({ required: true, initial: "deception" }),
        skill2: new fields.StringField({ required: true, initial: "disguise" }),
        skill3: new fields.StringField({ required: true, initial: "resistanceBiological" }),
        skill4: new fields.StringField({ required: true, initial: "stealth" }),
      }),
      raven: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "minor" }),
        bolstering: new fields.StringField({ required: true, initial: "significant" }),
        controlling: new fields.StringField({ required: true, initial: "minor" }),
        creation: new fields.StringField({ required: true, initial: "moderate" }),
        destructive: new fields.StringField({ required: true, initial: "moderate" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "moderate" }),
        reduction: new fields.StringField({ required: true, initial: "significant" }),
        summoning: new fields.StringField({ required: true, initial: "minor" }),
        transformation: new fields.StringField({ required: true, initial: "grand" }),
        skill1: new fields.StringField({ required: true, initial: "deception" }),
        skill2: new fields.StringField({ required: true, initial: "history" }),
        skill3: new fields.StringField({ required: true, initial: "perception" }),
        skill4: new fields.StringField({ required: true, initial: "persuasion" }),
      }),
      snake: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "moderate" }),
        bolstering: new fields.StringField({ required: true, initial: "minor" }),
        controlling: new fields.StringField({ required: true, initial: "moderate" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "minor" }),
        healing: new fields.StringField({ required: true, initial: "grand" }),
        protective: new fields.StringField({ required: true, initial: "significant" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "significant" }),
        skill1: new fields.StringField({ required: true, initial: "combatMelee" }),
        skill2: new fields.StringField({ required: true, initial: "history" }),
        skill3: new fields.StringField({ required: true, initial: "medicine" }),
        skill4: new fields.StringField({ required: true, initial: "resistanceBiological" }),
      }),
      wolf: new fields.SchemaField({
        banishing: new fields.StringField({ required: true, initial: "moderate" }),
        bolstering: new fields.StringField({ required: true, initial: "moderate" }),
        controlling: new fields.StringField({ required: true, initial: "grand" }),
        creation: new fields.StringField({ required: true, initial: "minor" }),
        destructive: new fields.StringField({ required: true, initial: "significant" }),
        healing: new fields.StringField({ required: true, initial: "minor" }),
        protective: new fields.StringField({ required: true, initial: "significant" }),
        reduction: new fields.StringField({ required: true, initial: "minor" }),
        summoning: new fields.StringField({ required: true, initial: "moderate" }),
        transformation: new fields.StringField({ required: true, initial: "minor" }),
        skill1: new fields.StringField({ required: true, initial: "animalHandling" }),
        skill2: new fields.StringField({ required: true, initial: "combatMelee" }),
        skill3: new fields.StringField({ required: true, initial: "intimidation" }),
        skill4: new fields.StringField({ required: true, initial: "survival" }),
      }),
    }),
    
    schema.currentTotemSelection = new fields.SchemaField({
      animal: new fields.StringField({ required: true, initial: "bear" }),
      totem: new fields.StringField({ required: true, initial: "banishing" }),
      grandTotal: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandActionCost: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandTotemChecks: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      grandDie: new fields.StringField({ initial: "" }),
      grandBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    });
    schema.totemCosts = new fields.SchemaField({
      banishing: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 6, min: 6 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costSize: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      bolstering: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costSkill: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      controlling: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 5, min: 5 }),
        costSize: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      creation: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costLife: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costSize: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 9, min: 1 }),
      }),
      destructive: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 2, min: 2 }),
        costDamageDice: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDamageNumber: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 5, min: 1 }),
      }),
      healing: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costHealing: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 6, min: 1 }),
      }),
      protective: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costArmorRating: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costHeavy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 8, min: 1 }),
      }),
      reduction: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costSkill: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 12, min: 1 }),
      }),
      summoning: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 6, min: 6 }),
        costSize: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 11, min: 1 }),
      }),
      transformation: new fields.SchemaField({
        costBase: new fields.NumberField({ ...requiredInteger, initial: 7, min: 7 }),
        costSize: new fields.NumberField({ ...requiredInteger, initial: 4, min: 4 }),
        costResistance: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costDuration: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
        costTotal: new fields.NumberField({ ...requiredInteger, initial: 12, min: 1 }),
      })
    })
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
    if(this.effects && this.effects.abl) {
      Object.keys(this.effects.abl).forEach((effect) => {
        // console.log("Processing Effect", effect);
        Object.keys(this.effects.abl[effect]).forEach((key) => {
          // console.log("Processing Key", key);
          Object.keys(this.effects.abl[effect][key]).forEach((subKey) => {
            // console.log("Processing SubKey", subKey);
            if(subKey === 'hindranceMod') {
              this.abilities[key][subKey] = Math.min(this.abilities[key][subKey], this.effects.abl[effect][key][subKey]);
            } else {
              this.abilities[key][subKey] = Math.max(this.abilities[key][subKey], this.effects.abl[effect][key][subKey]);
            }            
          })
        })
      })
    }
    // If full body replacement, then we need to zero out the bioMods
    if(this.effects && this.effects.stb && this.effects.stb.torsoHeadReplacement) {
      if(this.effects.abl.cheetahAugmentation) { this.abilities.quickness.bioMod = 0; }
      if(this.effects.abl.gorillaAugmentation) { this.abilities.strength.bioMod = 0; }
      if(this.effects.abl.leopardAugmentation) { this.abilities.agility.bioMod = 0; }
      if(this.effects.abl.ostrichAugmentation) { this.abilities.endurance.bioMod = 0; }
    }
    // SET THE ABILITY TOTAL BONUS
    Object.keys(this.abilities).forEach((key) => {
      this.abilities[key].totalBonus = this.abilities[key].bonusMod + this.abilities[key].hindranceMod + this.abilities[key].traitMod + Math.max(this.abilities[key].cyberMod, this.abilities[key].bioMod);
    })

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
    const defenseMeleeBonus = Math.max(Math.floor((this.abilities.agility.totalBonus + this.abilities.intuition.totalBonus)/ 2),0) + 6;
    const defenseRangedBonus = Math.max(Math.floor((this.abilities.quickness.totalBonus + this.abilities.intuition.totalBonus)/ 2),0) + 6;
    const fatigueBonus = Math.max(Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2),0) + 1;
    const paceBonus = Math.max(Math.floor((this.abilities.agility.totalBonus + this.abilities.quickness.totalBonus)/ 2),0) + 2;
    const stabilityBonus = Math.max(Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2),0);

    const defenseMeleeHindrance = this.derivedAbilityValues.defenseMelee.hindranceMod;
    const defenseMeleeTrait = this.derivedAbilityValues.defenseMelee.traitMod;
    const defenseRangedHindrance = this.derivedAbilityValues.defenseRanged.hindranceMod;
    const defenseRangedTrait = this.derivedAbilityValues.defenseRanged.traitMod;
    const fatigueHindrance = this.derivedAbilityValues.fatigueMaximum.hindranceMod;
    const fatigueTrait = this.derivedAbilityValues.fatigueMaximum.traitMod;
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
      },
      survivalRating: {
        bonusMod: 0,
        hindranceMod: 0,
        traitMod: 0,
        totalBonus: 0
      }
    }
    console.log("Preparing Derived Data for Character -- 2", this);

    console.log("Preparing Derived Data for Character -- PRE AUGMENT", this);

    // console.log("STABILITY TOTAL", this.derivedAbilityValues.stability.totalBonus);
    let curStability = this.derivedAbilityValues.stability.totalBonus;
    let cyberneticCount = 0;
    let bioneticCount = 0;
    if(this.effects && this.effects.cyb) {
      Object.keys(this.effects.cyb).forEach((effect) => {
        // console.log("Processing Effect", effect);
        Object.keys(this.effects.cyb[effect]).forEach((key) => {
          // console.log("Processing Key", key);
          // console.log("CUR STABILITY PRE", curStability);
          curStability -= this.effects.cyb[effect].stability;
          // console.log("CUR STABILITY POST", curStability);
          cyberneticCount += 1;
        })
      })
    }
    if(this.effects && this.effects.bio) {
      Object.keys(this.effects.bio).forEach((effect) => {
        // console.log("Processing Effect", effect);
        Object.keys(this.effects.bio[effect]).forEach((key) => {
          // console.log("Processing Key", key);
          // console.log("CUR STABILITY PRE", curStability);
          curStability -= this.effects.bio[effect].stability;
          // console.log("CUR STABILITY POST", curStability);
          bioneticCount += 1;
        })
      })
    }
    this.curStability = curStability;
    this.cyberneticCount = -1 * cyberneticCount;
    this.bioneticCount = -1 * bioneticCount;

    for (let item in this.actionWords) {
      this.actionWords[item].bioMod = this.bioneticCount;
      this.actionWords[item].cyberMod = this.cyberneticCount;
      this.actionWords[item].totalBonus = this.actionWords[item].bonusMod + this.actionWords[item].hindranceMod + this.actionWords[item].traitMod + this.bioneticCount + this.cyberneticCount;
    }
    for (let item in this.powerWords) {
      this.powerWords[item].bioMod = this.bioneticCount;
      this.powerWords[item].cyberMod = this.cyberneticCount;
      this.powerWords[item].totalBonus = this.powerWords[item].bonusMod + this.powerWords[item].hindranceMod + this.powerWords[item].traitMod + this.bioneticCount + this.cyberneticCount;
    }
    for (let item in this.targetWords) {
      this.targetWords[item].bioMod = this.bioneticCount;
      this.targetWords[item].cyberMod = this.cyberneticCount;
      this.targetWords[item].totalBonus = this.targetWords[item].bonusMod + this.targetWords[item].hindranceMod + this.targetWords[item].traitMod + this.bioneticCount + this.cyberneticCount;
    }
    for (let item in this.psychic) {
      console.log("ITEM", item);
      this.psychic[item].bioMod = this.bioneticCount;
      this.psychic[item].cyberMod = this.cyberneticCount;
      this.psychic[item].totalBonus = this.psychic[item].bonusMod + this.psychic[item].hindranceMod + this.psychic[item].traitMod + this.bioneticCount + this.cyberneticCount;
    }
    for (let item in this.totem) {
      console.log("ITEM", item);
      this.totem[item].bioMod = this.bioneticCount;
      this.totem[item].cyberMod = this.cyberneticCount;
      this.totem[item].totalBonus = this.totem[item].bonusMod + this.totem[item].hindranceMod + this.totem[item].traitMod + this.bioneticCount + this.cyberneticCount;
    }

    console.log("Preparing Derived Data for Character -- POST AUGMENT", this);


    /* Derived Ability Pools */
    let cyberneticCalc = 0;
    if(this.effects && this.effects.stb && this.effects.stb.torsoHeadReplacement) { cyberneticCalc += 2; }
    if(this.effects && this.effects.stb && this.effects.stb.armReplacementLeft) { cyberneticCalc += 2; }
    if(this.effects && this.effects.stb && this.effects.stb.armReplacementRight) { cyberneticCalc += 2; }
    if(this.effects && this.effects.stb && this.effects.stb.legReplacementLeft) { cyberneticCalc += 2; }
    if(this.effects && this.effects.stb && this.effects.stb.legReplacementRight) { cyberneticCalc += 2; }
    const resourceCalc = 2 + this.derivedAbilityPools.resourcePool.traitMod;
    const faithCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.intuition.totalBonus)/ 2) + this.derivedAbilityPools.faithPool.hindranceMod + this.derivedAbilityPools.faithPool.traitMod;
    const gritCalc = 2 + this.derivedAbilityPools.gritDie.hindranceMod + this.derivedAbilityPools.gritDie.traitMod;
    const healthCalc = Math.floor((this.abilities.endurance.totalBonus + this.abilities.willpower.totalBonus)/ 2) + this.derivedAbilityPools.healthPool.hindranceMod + this.derivedAbilityPools.healthPool.traitMod - cyberneticCalc;
    const manaCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.reasoning.totalBonus)/ 2) + this.derivedAbilityPools.manaPool.hindranceMod + this.derivedAbilityPools.manaPool.traitMod;
    const psychicCalc = Math.floor((this.abilities.willpower.totalBonus + this.abilities.presence.totalBonus)/ 2) + this.derivedAbilityPools.psychicPool.hindranceMod + this.derivedAbilityPools.psychicPool.traitMod;
    const paceDieCalc = Math.floor((this.abilities.agility.totalBonus + this.abilities.quickness.totalBonus)/ 2) + this.derivedAbilityPools.paceDie.hindranceMod + this.derivedAbilityPools.paceDie.traitMod;
    const initiativeCalc = Math.floor((this.abilities.quickness.totalBonus + this.abilities.intuition.totalBonus)/ 2) + this.derivedAbilityPools.initiativeDie.hindranceMod + this.derivedAbilityPools.initiativeDie.traitMod;

    /* Calc Cybernetic Pool based on Installed Limbs */
    let initiativeDie = "";
    if (initiativeCalc < 3) {
      initiativeDie = "d12+0";
    } else if (initiativeCalc < 5) {
      initiativeDie = "d10+2";
    } else if (initiativeCalc < 7) {
      initiativeDie = "d8+4";
    } else if (initiativeCalc < 9) {
      initiativeDie = "d6+6";
    } else if (initiativeCalc < 11) {
      initiativeDie = "d4+8";
    } else { 
      initiativeDie = "d2+10";
    }
    let cyberneticDie = "";
    let cyberneticTotal = 0
    if (cyberneticCalc  === 0 ) {
      cyberneticDie = "d0";
      cyberneticTotal = 0
    } else if (cyberneticCalc < 3) {
      cyberneticDie = "d4";
      cyberneticTotal = 4
    } else if (cyberneticCalc < 5) {
      cyberneticDie = "d6";
      cyberneticTotal = 6
    } else if (cyberneticCalc < 7) {
      cyberneticDie = "d8";
      cyberneticTotal = 8
    } else if (cyberneticCalc < 9) {
      cyberneticDie = "d10";
      cyberneticTotal = 10
    } else {
      cyberneticDie = "d12";
      cyberneticTotal = 12
    }
    let resourceDie = "";
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
    /* Calc Grit Die */
    let gritDie = "";
    if (gritCalc < 1) {
      gritDie = "d2";
    } else if (gritCalc === 1) {
      gritDie = "d4";
    } else if (gritCalc === 2) {
      gritDie = "d6";
    } else {
      gritDie = "d8";
    }
    /* Calc Health Pool */
    let healthDie = "";
    let healthTotal = 0
    if (healthCalc < 3) {
      healthDie = "d4";
      healthTotal = 4
    } else if (healthCalc < 5) {
      healthDie = "d6";
      healthTotal = 6
    } else if (healthCalc < 7) {
      healthDie = "d8";
      healthTotal = 8
    } else if (healthCalc < 9) {
      healthDie = "d10";
      healthTotal = 10
    } else {
      healthDie = "d12";
      healthTotal = 12
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
        die: cybCurrentDie,
        calc: cyberneticCalc,
        currentDie: cybCurrentDie
      },
      faithPool: {
        die: faithDie,
        calc: faithCalc,
        currentDie: fthCurrentDie
      },
      gritDie: {
        die: gritDie,
        calc: gritCalc,
        currentDie: gritDie
      },
      healthPool: {
        die: healthDie,
        calc: healthCalc,
        currentDie: hltCurrentDie
      },
      initiativeDie: {
        die: initiativeDie,
        calc: initiativeCalc,
        currentDie: initiativeDie
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


    /* MAGIC WORDS */
    // Setting the training status for each word
    const actionWords = this.actionWords;
    for (let word in actionWords) {
      if (Object.prototype.hasOwnProperty.call(actionWords, word)) {
        const die1 = this.abilities[actionWords[word].attr1].die;
        const die2 = this.abilities[actionWords[word].attr2].die;
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
        actionWords[word].maxTrainingStatus = training;
        const totalBonus = actionWords[word].bonusMod + actionWords[word].hindranceMod + actionWords[word].traitMod + actionWords[word].cyberMod + actionWords[word].bioMod;
        actionWords[word].totalBonus = totalBonus;
        if (totalBonus < 0) {
          actionWords[word].isNegBase = true;
        } else {
          actionWords[word].isNegBase = false;
        }
      }
    }
    const powerWords = this.powerWords;
    for (let word in powerWords) {
      if (Object.prototype.hasOwnProperty.call(powerWords, word)) {
        const die1 = this.abilities[powerWords[word].attr1].die;
        const die2 = this.abilities[powerWords[word].attr2].die;
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
        powerWords[word].maxTrainingStatus = training;
        const totalBonus = powerWords[word].bonusMod + powerWords[word].hindranceMod + powerWords[word].traitMod + powerWords[word].cyberMod + powerWords[word].bioMod;
        powerWords[word].totalBonus = totalBonus;
        if (totalBonus < 0) {
          powerWords[word].isNegBase = true;
        } else {
          powerWords[word].isNegBase = false;
        }
      }
    }
    const targetWords = this.targetWords;
    for (let word in targetWords) {
      if (Object.prototype.hasOwnProperty.call(targetWords, word)) {
        const die1 = this.abilities[targetWords[word].attr1].die;
        const die2 = this.abilities[targetWords[word].attr2].die;
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
        targetWords[word].maxTrainingStatus = training;
        const totalBonus = targetWords[word].bonusMod + targetWords[word].hindranceMod + targetWords[word].traitMod + targetWords[word].cyberMod + targetWords[word].bioMod;
        targetWords[word].totalBonus = totalBonus;
        if (totalBonus < 0) {
          targetWords[word].isNegBase = true;
        } else {
          targetWords[word].isNegBase = false;
        }
      }
    }

    /* -----------------
    *  Keep magic totals update
    *  ----------------- */
   console.log("Preparing Derived Data for Character -- 4", this);
    const currentWordSelection = this.currentWordSelection;
    const wordCosts = this.wordCosts;
    const actionWordCost = "word" + currentWordSelection.actionWord.charAt(0).toUpperCase() + currentWordSelection.actionWord.slice(1);
    const powerWordCost = "word" + currentWordSelection.powerWord.charAt(0).toUpperCase() + currentWordSelection.powerWord.slice(1);
    const targetWordCost = "word" + currentWordSelection.targetWord.charAt(0).toUpperCase() + currentWordSelection.targetWord.slice(1);
    //figure out the total costs of the words
    const actionTotal = wordCosts[actionWordCost].costTotal;
    const powerTotal = wordCosts[powerWordCost].costTotal;
    const targetTotal = wordCosts[targetWordCost].costTotal;
    //assign the total costs
    currentWordSelection.actionTotal = actionTotal;
    currentWordSelection.powerTotal = powerTotal;
    currentWordSelection.targetTotal = targetTotal;
    //assign the grand total
    const grandTotal = actionTotal + powerTotal + targetTotal;
    currentWordSelection.grandTotal = grandTotal;
    currentWordSelection.grandActionCost = Math.ceil(grandTotal / 6);
    currentWordSelection.grandManaChecks = Math.ceil(grandTotal / 12);
    //figure out lowest die...
    const actionDie = this.actionWords[currentWordSelection.actionWord].die;
    const actionBonus = this.actionWords[currentWordSelection.actionWord].totalBonus;
    const powerDie = this.powerWords[currentWordSelection.powerWord].die;
    const powerBonus = this.powerWords[currentWordSelection.powerWord].totalBonus;
    const targetDie = this.targetWords[currentWordSelection.targetWord].die;
    const targetBonus = this.targetWords[currentWordSelection.targetWord].totalBonus;
    const mapping = {
      "d12": 0,
      "d10": 1,
      "d8": 2,
      "d6": 3,
      "d4": 4,
      "d2": 5
    }
    const actionMapping = mapping[actionDie];
    const powerMapping = mapping[powerDie];
    const targetMapping = mapping[targetDie];

    if(actionMapping <= powerMapping && actionMapping <= targetMapping) {
      currentWordSelection.grandLowestDie = actionDie;
      currentWordSelection.grandLowestBonus = actionBonus;
    } else if(powerMapping <= actionMapping && powerMapping <= targetMapping) {
      currentWordSelection.grandLowestDie = powerDie;
      currentWordSelection.grandLowestBonus = powerBonus;
    } else {
      currentWordSelection.grandLowestDie = targetDie;
      currentWordSelection.grandLowestBonus = targetBonus;
    }

    /* ---------------------------
    *  Psychic Powers
    *  --------------------------- */
    const currentPsychicSelection = this.currentPsychicSelection;
    const psychicCosts = this.psychicCosts;
    const psychicPowerTotal = psychicCosts[currentPsychicSelection.power].costTotal;
    currentPsychicSelection.grandTotal = psychicPowerTotal;
    currentPsychicSelection.grandActionCost = Math.ceil(psychicPowerTotal / 6);
    currentPsychicSelection.grandPsychicChecks = Math.ceil(psychicPowerTotal / 12);
    currentPsychicSelection.grandDie = this.psychic[currentPsychicSelection.power].die;
    currentPsychicSelection.grandBonus = this.psychic[currentPsychicSelection.power].totalBonus;

    /* ---------------------------
    * Totem Aspects Calcs
    * --------------------------- */
    const currentTotemSelection = this.currentTotemSelection;
    const totemCosts = this.totemCosts;
    const totemTotemTotal = totemCosts[currentTotemSelection.totem].costTotal;
    currentTotemSelection.grandTotal = totemTotemTotal;
    currentTotemSelection.grandActionCost = Math.ceil(totemTotemTotal / 6);
    currentTotemSelection.grandTotemChecks = Math.ceil(totemTotemTotal / 12);
    currentTotemSelection.grandDie = this.totem[currentTotemSelection.totem].die;
    currentTotemSelection.grandBonus = this.totem[currentTotemSelection.totem].totalBonus;


    console.log("HERE IS WHERE I HAVE TO PREPARE SURVIVAL RATING")

    const survivalRatingBonus = Math.ceil((defenseMeleeBonus + defenseRangedBonus)/2) + healthTotal + cyberneticTotal
    const survivalRatingSkillsCM = this.skills.combatMelee.totalBonus
    const survivalRatingSkillsCB = this.skills.combatBow.totalBonus
    const survivalRatingSkillsCF = this.skills.combatFirearms.totalBonus
    let survivalRatingMaxWord = 0
    let survivalRatingMaxPsychic = 0
    let survivalRatingMaxTotem = 0
    for (let item in this.actionWords) {
      survivalRatingMaxWord = item.totalBonus > survivalRatingMaxWord ? item.totalBonus : survivalRatingMaxWord
    }
    for (let item in this.powerWords) {
      survivalRatingMaxWord = item.totalBonus > survivalRatingMaxWord ? item.totalBonus : survivalRatingMaxWord
    }
    for (let item in this.targetWords) {
      survivalRatingMaxWord = item.totalBonus > survivalRatingMaxWord ? item.totalBonus : survivalRatingMaxWord
    }
    for (let item in this.psychic) {
      survivalRatingMaxPsychic = item.totalBonus > survivalRatingMaxPsychic ? item.totalBonus : survivalRatingMaxPsychic
    }
    for (let item in this.totem) {
      survivalRatingMaxTotem = item.totalBonus > survivalRatingMaxTotem ? item.totalBonus : survivalRatingMaxTotem
    }
    const survivalRatingRange = Math.max(survivalRatingSkillsCB, survivalRatingSkillsCF, survivalRatingMaxWord, survivalRatingMaxPsychic, survivalRatingMaxTotem)
    const survivalRatingTotal = survivalRatingBonus + Math.ceil((survivalRatingSkillsCM + survivalRatingRange)/2)
    this.derivedAbilityValues.survivalRating.totalBonus = survivalRatingTotal
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