import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGPowerArmor extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Break down roll formula into three independent fields
    schema.powerarmor = new fields.SchemaField({
      armorRating: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      armorDie: new fields.StringField({ initial: "d4" }),
      armorCurrentDie: new fields.StringField({ initial: "" }),
      properties: new fields.StringField({ initial: "" }),
      pace: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      paceDie: new fields.StringField({ initial: "d4" }),
      size: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    })

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const powerarmor = this.powerarmor;

    if (powerarmor.armorCurrentDie === '') {
      this.powerarmor.armorCurrentDie = powerarmor.armorDie;
    } else {
      this.powerarmor.armorCurrentDie = powerarmor.armorCurrentDie;
    }

    this.formula = `${powerarmor.armorCurrentDie}`
  }
}