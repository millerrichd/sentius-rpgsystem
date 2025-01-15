import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGArmor extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.creditCost = new fields.StringField({ initial: "" });
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.armorRating = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.armorDie = new fields.StringField({ initial: "d4" });
    schema.armorCurrentDie = new fields.StringField({ initial: "" });
    schema.minStrengthBonus = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.locations = new fields.StringField({ initial: "" });
    schema.properties = new fields.StringField({ initial: "" });
    schema.rarity = new fields.StringField({ initial: "d4" });
    schema.worn = new fields.BooleanField({ initial: false });
    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    if(this.armorCurrentDie === "") {
      this.armorCurrentDie = this.armorDie;
    }
    this.formula = `${this.armorCurrentDie}`
  }
}