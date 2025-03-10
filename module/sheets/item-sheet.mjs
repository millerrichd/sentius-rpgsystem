import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SentiusRPGItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sentius-rpg', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/sentius-rpgsystem/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.SENTIUS_RPG
    context.config = CONFIG.SENTIUS_RPG;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );

    html.on('click', '.mark-heavy', async (ev) => {
      await this.item.update({
        'system.heavyWeapon': !this.item.system.heavyWeapon,
      });
    });

    html.on('click', '.mark-twohands', async (ev) => {
      await this.item.update({
        'system.twohanded': !this.item.system.twohanded,
      });
    });

    html.on('click', '.mark-burning', async (ev) => {
      await this.item.update({
        'system.burning': !this.item.system.burning,
      });
    });

    html.on('click', '.mark-dist', async (ev) => {
      await this.item.update({
        'system.disintegration': !this.item.system.disintegration,
      });
    });

    html.on('click', '.mark-jump', async (ev) => {
      await this.item.update({
        'system.jumpPack': !this.item.system.jumpPack,
      });
    });

    html.on('click', '.mark-stabilizer', async (ev) => {
      await this.item.update({
        'system.stabilizer': !this.item.system.stabilizer,
      });
    });

    html.on('click', '.mark-finicky', async (ev) => {
      await this.item.update({
        'system.finicky': !this.item.system.finicky,
      });
    });

    html.on('click', '.mark-energyPod', async (ev) => {
      await this.item.update({
        'system.energyPod': !this.item.system.energyPod,
      });
    });

    html.on('click', '.mark-target', async (ev) => {
      await this.item.update({
        'system.targetSystem': !this.item.system.targetSystem,
      });
    });

    html.on('click', '.mark-amecm', async (ev) => {
      await this.item.update({
        'system.amEcm': !this.item.system.amEcm,
      });
    });

    html.on('click', '.mark-heavyarmor', async (ev) => {
      await this.item.update({
        'system.heavyArmor': !this.item.system.heavyArmor,
      });
    });

    html.on('click', '.mark-linked', async (ev) => {
      await this.item.update({
        'system.twinlinked': !this.item.system.twinlinked,
      });
    });

    html.on('click', '.mark-flight', async (ev) => {
      await this.item.update({
        'system.flight': !this.item.system.flight,
      });
    });
    html.on('click', '.mark-av', async (ev) => {
      await this.item.update({
        'system.av': !this.item.system.av,
      });
    });
    html.on('click', '.mark-cmdSuite', async (ev) => {
      await this.item.update({
        'system.cmdSuite': !this.item.system.cmdSuite,
      });
    });
    html.on('click', '.mark-exposedCrew', async (ev) => {
      await this.item.update({
        'system.exposedCrew': !this.item.system.exposedCrew,
      });
    });
    html.on('click', '.mark-passengers', async (ev) => {
      await this.item.update({
        'system.passengers': !this.item.system.passengers,
      });
    });

    html.on('click', '.increase-armor', async (ev) => {
      const armor = this.item.system;
      const mapping = {
        'd12': 12,
        'd10': 10,
        'd8': 8,
        'd6': 6,
        'd4': 4,
        'd2': 2,
        'd1': 1,
        'd0': 0
      }
      let current = '';
      if (mapping[armor.armorCurrentDie] < mapping[armor.armorDie] && armor.armorCurrentDie === 'd0') {
        current = 'd1';
      } else if (mapping[armor.armorCurrentDie] < mapping[armor.armorDie] && armor.armorCurrentDie === 'd1') {
        current = 'd2';
      } else if (mapping[armor.armorCurrentDie] < mapping[armor.armorDie] && armor.armorCurrentDie === 'd2') {
        current = 'd4';
      } else if (mapping[armor.armorCurrentDie] < mapping[armor.armorDie] && armor.armorCurrentDie === 'd4') {
        current = 'd6';
      } else if (mapping[armor.armorCurrentDie] < mapping[armor.armorDie] && armor.armorCurrentDie === 'd6') {
        current = 'd8';
      } else if (mapping[armor.armorCurrentDie] < mapping[armor.armorDie] && armor.armorCurrentDie === 'd8') {
        current = 'd10';
      } else if (mapping[armor.armorCurrentDie] < mapping[armor.armorDie] && armor.armorCurrentDie === 'd10') {
        current = 'd12';
      } else {
        current = armor.armorCurrentDie;
      }

      await this.item.update({
        'system.armorCurrentDie': current,
      });
    });

    html.on('click', '.decrease-armor', async (ev) => {
      const armor = this.item.system;

      let current = '';
      if (armor.armorCurrentDie === 'd12') {
        current = 'd10';
      } else if (armor.armorCurrentDie === 'd10') {
        current = 'd8';
      } else if (armor.armorCurrentDie === 'd8') {
        current = 'd6';
      } else if (armor.armorCurrentDie === 'd6') {
        current = 'd4';
      } else if (armor.armorCurrentDie === 'd4') {
        current = 'd2';
      } else if (armor.armorCurrentDie === 'd2') {
        current = 'd1';
      } else {
        current = 'd0';
      }

      await this.item.update({
        'system.armorCurrentDie': current,
      });
    });

    html.on('click', '.increase-supply', async (ev) => {
      const gear = this.item.system;
      console.log("INCREASE GEAR", gear);
      const mapping = {
        'd12': 12,
        'd10': 10,
        'd8': 8,
        'd6': 6,
        'd4': 4,
        'd2': 2,
        'd1': 1,
        'd0': 0
      }
      let current = '';
      if (mapping[gear.supplyCurrentDie] < mapping[gear.supplyDie] && gear.supplyCurrentDie === 'd0') {
        current = 'd1';
      } else if (mapping[gear.supplyCurrentDie] < mapping[gear.supplyDie] && gear.supplyCurrentDie === 'd1') {
        current = 'd2';
      } else if (mapping[gear.supplyCurrentDie] < mapping[gear.supplyDie] && gear.supplyCurrentDie === 'd2') {
        current = 'd4';
      } else if (mapping[gear.supplyCurrentDie] < mapping[gear.supplyDie] && gear.supplyCurrentDie === 'd4') {
        current = 'd6';
      } else if (mapping[gear.supplyCurrentDie] < mapping[gear.supplyDie] && gear.supplyCurrentDie === 'd6') {
        current = 'd8';
      } else if (mapping[gear.supplyCurrentDie] < mapping[gear.supplyDie] && gear.supplyCurrentDie === 'd8') {
        current = 'd10';
      } else if (mapping[gear.supplyCurrentDie] < mapping[gear.supplyDie] && gear.supplyCurrentDie === 'd10') {
        current = 'd12';
      } else {
        current = gear.supplyCurrentDie;
      }

      await this.item.update({
        'system.supplyCurrentDie': current,
      });
    });

    html.on('click', '.decrease-supply', async (ev) => {
      const gear = this.item.system;
      console.log("DECREASE GEAR", gear);
      let current = '';
      if (gear.supplyCurrentDie === 'd12') {
        current = 'd10';
      } else if (gear.supplyCurrentDie === 'd10') {
        current = 'd8';
      } else if (gear.supplyCurrentDie === 'd8') {
        current = 'd6';
      } else if (gear.supplyCurrentDie === 'd6') {
        current = 'd4';
      } else if (gear.supplyCurrentDie === 'd4') {
        current = 'd2';
      } else if (gear.supplyCurrentDie === 'd2') {
        current = 'd1';
      } else {
        current = 'd0';
      }

      await this.item.update({
        'system.supplyCurrentDie': current,
      });
    });

    html.on('click', '.increase-vehicle', async (ev) => {
      const vehicle = this.item.system;
      const mapping = {
        'd12': 12,
        'd10': 10,
        'd8': 8,
        'd6': 6,
        'd4': 4,
        'd2': 2,
        'd1': 1,
        'd0': 0
      }
      let current = '';
      if (mapping[vehicle.armorCurrentDie] < mapping[vehicle.armorDie] && vehicle.armorCurrentDie === 'd0') {
        current = 'd1';
      } else if (mapping[vehicle.armorCurrentDie] < mapping[vehicle.armorDie] && vehicle.armorCurrentDie === 'd1') {
        current = 'd2';
      } else if (mapping[vehicle.armorCurrentDie] < mapping[vehicle.armorDie] && vehicle.armorCurrentDie === 'd2') {
        current = 'd4';
      } else if (mapping[vehicle.armorCurrentDie] < mapping[vehicle.armorDie] && vehicle.armorCurrentDie === 'd4') {
        current = 'd6';
      } else if (mapping[vehicle.armorCurrentDie] < mapping[vehicle.armorDie] && vehicle.armorCurrentDie === 'd6') {
        current = 'd8';
      } else if (mapping[vehicle.armorCurrentDie] < mapping[vehicle.armorDie] && vehicle.armorCurrentDie === 'd8') {
        current = 'd10';
      } else if (mapping[vehicle.armorCurrentDie] < mapping[vehicle.armorDie] && vehicle.armorCurrentDie === 'd10') {
        current = 'd12';
      } else {
        current = vehicle.armorCurrentDie;
      }

      await this.item.update({
        'system.armorCurrentDie': current,
      });
    });

    html.on('click', '.decrease-vehicle', async (ev) => {
      const vehicle = this.item.system;

      let current = '';
      if (vehicle.armorCurrentDie === 'd12') {
        current = 'd10';
      } else if (vehicle.armorCurrentDie === 'd10') {
        current = 'd8';
      } else if (vehicle.armorCurrentDie === 'd8') {
        current = 'd6';
      } else if (vehicle.armorCurrentDie === 'd6') {
        current = 'd4';
      } else if (vehicle.armorCurrentDie === 'd4') {
        current = 'd2';
      } else if (vehicle.armorCurrentDie === 'd2') {
        current = 'd1';
      } else {
        current = 'd0';
      }

      await this.item.update({
        'system.armorCurrentDie': current,
      });
    });
  }
}