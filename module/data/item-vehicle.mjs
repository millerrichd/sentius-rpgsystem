import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGVehicle extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Break down roll formula into three independent fields
    schema.vehicle = new fields.SchemaField({
      armorRating: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      armorDie: new fields.StringField({ initial: "d4" }),
      armorCurrentDie: new fields.StringField({ initial: "" }),
      properties: new fields.StringField({ initial: "" }),
      speed: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      defense: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      handling: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      crew: new fields.StringField({ initial: "1" })
    })

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const vehicle = this.vehicle;

    if (vehicle.armorCurrentDie === '') {
      this.vehicle.armorCurrentDie = vehicle.armorDie;
    } else {
      this.vehicle.armorCurrentDie = vehicle.armorCurrentDie;
    }

    this.formula = `${vehicle.armorCurrentDie}`
  }
}