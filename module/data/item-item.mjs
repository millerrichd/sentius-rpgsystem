import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGItem extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Break down roll formula into three independent fields
    schema.creditCost = new fields.StringField({ initial: "" }),
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
    schema.rarity = new fields.StringField({ initial: "d4" }),
    schema.supplyDie = new fields.StringField({ initial: "d4" }),
    schema.supplyCurrentDie = new fields.StringField({ initial: "" }),
    schema.properties = new fields.StringField({ initial: "" })

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    if (this.supplyCurrentDie === '') {
      this.supplyCurrentDie = this.supplyDie;
    } else {
      this.supplyCurrentDie = this.supplyCurrentDie;
    }

    this.formula = `${this.supplyCurrentDie}`
  }
}