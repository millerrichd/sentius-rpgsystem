import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGWeapon extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Break down roll formula into three independent fields
    schema.weapon = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d4" }),
      diceBonus: new fields.StringField({ initial: "+@str.bonus" }),
      rangeIncrement: new fields.NumberField({ ...requiredInteger, initial: 5 }),
      damageType: new fields.StringField({ initial: "slashing" }),
      attackType: new fields.StringField({ initial: "melee" }),
      properties: new fields.StringField({ initial: "" }),
      armorPiercing: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      minStrengthBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      capacity: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      rateOfFire: new fields.NumberField({ ...requiredInteger, initial: 1 }),
    })

    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const weapon = this.weapon;

    this.formula = `${weapon.diceNum}${weapon.diceSize}${weapon.diceBonus}`
  }
}