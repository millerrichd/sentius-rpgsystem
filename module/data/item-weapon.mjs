import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGWeapon extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Break down roll formula into three independent fields
    schema.creditCost = new fields.StringField({ initial: "" });
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.rarity = new fields.StringField({ initial: "d4" });
    schema.diceNum = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.diceSize = new fields.StringField({ initial: "d4" });
    schema.diceBonus = new fields.StringField({ initial: "+0" });
    schema.rangeIncrement = new fields.NumberField({ ...requiredInteger, initial: 5 });
    schema.damageType = new fields.StringField({ initial: "Kinetic" });
    schema.attackType = new fields.StringField({ initial: "Ranged" });
    schema.properties = new fields.StringField({ initial: "" });
    schema.armorPiercing = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.minStrengthBonus = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.capacity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.rateOfFire = new fields.NumberField({ ...requiredInteger, initial: 1 });
    schema.heavyWeapon = new fields.BooleanField({ initial: false });
    schema.equipped = new fields.BooleanField({ initial: false });
    schema.twohanded = new fields.BooleanField({ initial: false });
    schema.burning = new fields.BooleanField({ initial: false });
    schema.disintegration = new fields.BooleanField({ initial: false });

    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    this.formula = `${this.diceNum}${this.diceSize}${this.diceBonus}`
  }
}