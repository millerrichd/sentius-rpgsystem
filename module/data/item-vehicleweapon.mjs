import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGVehicleWeapon extends SentiusRPGItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Break down roll formula into three independent fields
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.diceNum = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.diceSize = new fields.StringField({ initial: "d4" });
    schema.totalDiceNum = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.totalDiceBonus = new fields.StringField({ initial: "+0" });
    schema.rangeIncrement = new fields.NumberField({ ...requiredInteger, initial: 5 });
    schema.damageType = new fields.StringField({ initial: "Energy" });
    schema.attackType = new fields.StringField({ initial: "Ranged" });
    schema.properties = new fields.StringField({ initial: "" });
    schema.armorPiercing = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.capacity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.curCapacity = new fields.NumberField({ ...requiredInteger, initial: -1, min: -1 });
    schema.rateOfFire = new fields.NumberField({ ...requiredInteger, initial: 1 });
    schema.heavyWeapon = new fields.BooleanField({ initial: false });
    schema.twinlinked = new fields.BooleanField({ initial: false });
    schema.fireArc = new fields.StringField({ initial: "Fire-Front" });

    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    if(this.curCapacity === -1) {
      this.curCapacity = this.capacity;
    }

    const totalDiceNum = this.diceNum * this.quantity;

    // Build the formula dynamically using string interpolation
    this.totalDiceNum = totalDiceNum;
    this.formula = `${totalDiceNum}${this.diceSize}`
  }
}