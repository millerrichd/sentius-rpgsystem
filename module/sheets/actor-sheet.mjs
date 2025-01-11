import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SentiusRPGActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sentius-rpg', 'sheet', 'actor'],
      width: 800,
      height: 800,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/sentius-rpgsystem/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.SENTIUS_RPG
    context.config = CONFIG.SENTIUS_RPG;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const hindrances = [];
    const traits = [];
    const spells = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to hindrances.
      else if (i.type === 'hindrance') {
        hindrances.push(i);
      }
      // Append to traits.
      else if (i.type === 'trait') {
        traits.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.hindrances = hindrances;
    context.traits = traits;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._buildRollOptions.bind(this));
//    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }

    //Increase and Decrease Abilities
    html.on('click', '.increase-ability', this._onIncreaseAbility.bind(this));
    html.on('click', '.decrease-ability', this._onDecreaseAbility.bind(this));

    //Increase and Decrease Pools
    html.on('click', '.increase-pool', this._onIncreasePool.bind(this));
    html.on('click', '.decrease-pool', this._onDecreasePool.bind(this));

    //Training Status Change
    html.on('change', '.training-select', this._onTrainingSelect.bind(this));
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  //THIS IS WHERE I BUILT THE QUICK OPTION FOR SKILL UPGRADE/STANDARD/DOWNGRADE
  _buildRollOptions(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log("Build Roll Options", event);

    if(dataset.rolltype === 'skill') {
      const die = dataset.die;
      const bonus = Number(dataset.bonus);
      let updie = '';
      let downdie = '';
      console.log("BONUS:", bonus, typeof(bonus));
      const upbonus = bonus + 2;
      const downbonus = bonus - 2;
      if(die === 'd12') {
        updie = 'd12';
        downdie = 'd10';
      } else if(die === 'd10') {
        updie = 'd12';
        downdie = 'd8';
      } else if(die === 'd8') {
        updie = 'd10';
        downdie = 'd6';
      } else if(die === 'd6') {
        updie = 'd8';
        downdie = 'd4';
      } else if(die === 'd4') {
        updie = 'd6';
        downdie = 'd2';
      } else if(die === 'd2') {
        updie = 'd4';
        downdie = 'd2';
      }

      let uproll = '';
      let stdroll = '';
      let downroll = '';
      if(upbonus < 0) {
        uproll = `${updie}${upbonus}`;
      } else {
        uproll = `${updie}+${upbonus}`;
      }
      if(bonus < 0) {
        stdroll = `${die}${bonus}`;
      } else {
        stdroll = `${die}+${bonus}`;
      }
      if(downbonus < 0) {
        downroll = `${downdie}${downbonus}`;
      } else {
        downroll = `${downdie}+${downbonus}`;
      }

      const label = `[${dataset.rolltype}] ${dataset.label}`;

      const d = new Dialog({
        title: "Roll Dialog",
        content: `<h3>Choose roll type</h3>`,
        buttons: {
          one: {
            icon: '<i class="fas fa-arrow-up"></i>',
            label: `Upgraded<br/>${uproll}`,
            callback:(() => {
              console.log(`Upgraded: ${uproll} ${label}`);
              let roll = new Roll(uproll, this.actor.getRollData());
              roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
              });
              return roll;
            })
          },
          two: {
            icon: '<i class="fas fa-arrows-h"></i>',
            label: `Standard<br/>${stdroll}`,
            callback:(() => {
              console.log(`Standard: ${stdroll} ${label}`);
              let roll = new Roll(stdroll, this.actor.getRollData());
              roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
              });
              return roll;
            })
          },
          three: {
            icon: '<i class="fas fa-arrow-down"></i>',
            label: `Downgraded<br/>${downroll}`,
            callback:(() => {
              console.log(`Downgraded: ${downroll} ${label}`);
              let roll = new Roll(downroll, this.actor.getRollData());
              roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
              });
              return roll;
            })
          }
        },
        default: "two"
      });
      d.render(true);
    } else {
      this._onRoll(event);
    }
  }

  _onRoll(event) {
    event.preventDefault();
    console.log("On Roll", event);
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[${dataset.rolltype}] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /* --------------------------------------------
    *  Ability Increase and Decrease
    * -------------------------------------------- */
  async _onIncreaseAbility(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const ability = element.dataset.ability;
    const actorData = this.actor.system;
    const currentDie = actorData.abilities[ability].die;
    const bonusMod = actorData.abilities[ability].bonusMod;
    const hindranceMod = actorData.abilities[ability].hindranceMod;
    const traitMod = actorData.abilities[ability].traitMod;
    const cyberMod = actorData.abilities[ability].cyberMod;

    let newDie = '';
    let newBonusMod = 0;
    let newTotalBonus = 0;
    if(currentDie === 'd12') { 
      newDie = 'd10';
      newBonusMod = 2;
    } else if(currentDie === 'd10') {
      newDie = 'd8';
      newBonusMod = 4;
    } else if(currentDie === 'd8') {
      newDie = 'd6';
      newBonusMod = 6;
    } else if(currentDie === 'd6') {
      newDie = 'd4';
      newBonusMod = 8;
    } else if(currentDie === 'd4') {
      newDie = 'd2';
      newBonusMod = 10;
    } else if(currentDie === 'd2') {
      newDie = 'd2';
      newBonusMod = 10;
    } else {
      newDie = currentDie;
      newBonusMod = bonusMod;
    }
    newTotalBonus = newBonusMod + hindranceMod + traitMod + cyberMod;
    await this.actor.update({
      [`system.abilities.${ability}.die`]: newDie,
      [`system.abilities.${ability}.bonusMod`]: newBonusMod,
      [`system.abilities.${ability}.totalBonus`]: newTotalBonus
    });
    // THIS FIXES THE DAP ISSUE NOT UPDATING
    if(actorData.derivedAbilityPools.cyberneticPool.currentDie === actorData.derivedAbilityPools.cyberneticPool.die) {
      await this.actor.update({
        [`system.derivedAbilityPools.cyberneticPool.currentDie`]: ''
      });
    }
    if(actorData.derivedAbilityPools.faithPool.currentDie === actorData.derivedAbilityPools.faithPool.die) {
      await this.actor.update({
        [`system.derivedAbilityPools.faithPool.currentDie`]: ''
      });
    }
    if(actorData.derivedAbilityPools.healthPool.currentDie === actorData.derivedAbilityPools.healthPool.die) {
      await this.actor.update({
        [`system.derivedAbilityPools.healthPool.currentDie`]: ''
      });
    }
    if(actorData.derivedAbilityPools.manaPool.currentDie === actorData.derivedAbilityPools.manaPool.die) {
      await this.actor.update({
        [`system.derivedAbilityPools.manaPool.currentDie`]: ''
      });
    }
    if(actorData.derivedAbilityPools.psychicPool.currentDie === actorData.derivedAbilityPools.psychicPool.die) {
      await this.actor.update({
        [`system.derivedAbilityPools.psychicPool.currentDie`]: ''
      });
    }
    if(actorData.derivedAbilityPools.resourcePool.currentDie === actorData.derivedAbilityPools.resourcePool.die) {
      await this.actor.update({
        [`system.derivedAbilityPools.resourcePool.currentDie`]: ''
      });
    }
  }
  async _onDecreaseAbility(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const ability = element.dataset.ability;
    const actorData = this.actor.system;
    const currentDie = actorData.abilities[ability].die;
    const bonusMod = actorData.abilities[ability].bonusMod;
    const hindranceMod = actorData.abilities[ability].hindranceMod;
    const traitMod = actorData.abilities[ability].traitMod;
    const cyberMod = actorData.abilities[ability].cyberMod;
    const bioMod = actorData.abilities[ability].bioMod;

    let newDie = '';
    let newBonusMod = 0;
    let newTotalBonus = 0;
    if(currentDie === 'd12') { 
      newDie = 'd12';
      newBonusMod = 0;
    } else if(currentDie === 'd10') {
      newDie = 'd12';
      newBonusMod = 0;
    } else if(currentDie === 'd8') {
      newDie = 'd10';
      newBonusMod = 2;
    } else if(currentDie === 'd6') {
      newDie = 'd8';
      newBonusMod = 4;
    } else if(currentDie === 'd4') {
      newDie = 'd6';
      newBonusMod = 6;
    } else if(currentDie === 'd2') {
      newDie = 'd4';
      newBonusMod = 8;
    } else {
      newDie = currentDie;
      newBonusMod = bonusMod;
    }
    newTotalBonus = newBonusMod + hindranceMod + traitMod + cyberMod + bioMod;
    await this.actor.update({
      [`system.abilities.${ability}.die`]: newDie,
      [`system.abilities.${ability}.bonusMod`]: newBonusMod,
      [`system.abilities.${ability}.totalBonus`]: newTotalBonus
    });
  }

  /* --------------------------------------------
    *  Pools Increase and Decrease
    * -------------------------------------------- */
  async _onIncreasePool(event) {
    event.preventDefault();
    const abilityName = event.currentTarget.dataset.ability;
    const abilityData = this.actor.system.derivedAbilityPools[abilityName];

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

    let newCurrent = 'd0';
    if(mapping[abilityData.currentDie] < mapping[abilityData.die] && abilityData.currentDie === 'd0') {
      newCurrent = 'd1';
    } else if(mapping[abilityData.currentDie] < mapping[abilityData.die] && abilityData.currentDie === 'd1') {
      newCurrent = 'd2';``
    } else if(mapping[abilityData.currentDie] < mapping[abilityData.die] && abilityData.currentDie === 'd2') {
      newCurrent = 'd4';
    } else if(mapping[abilityData.currentDie] < mapping[abilityData.die] && abilityData.currentDie === 'd4') {
      newCurrent = 'd6';
    } else if(mapping[abilityData.currentDie] < mapping[abilityData.die] && abilityData.currentDie === 'd6') {
      newCurrent = 'd8';
    } else if(mapping[abilityData.currentDie] < mapping[abilityData.die] && abilityData.currentDie === 'd8') {
      newCurrent = 'd10';
    } else if(mapping[abilityData.currentDie] < mapping[abilityData.die] && abilityData.currentDie === 'd10') {
      newCurrent = 'd12';
    } else {
      newCurrent = abilityData.currentDie; 
    }
    const result = await this.actor.update({
      [`system.derivedAbilityPools.${abilityName}.currentDie`]: newCurrent
    });
  }
  async _onDecreasePool(event) {
    event.preventDefault();
    const abilityName = event.currentTarget.dataset.ability;
    const abilityData = this.actor.system.derivedAbilityPools[abilityName];

    let newCurrent = 'd12';
    if(abilityData.currentDie === 'd12') {
      newCurrent = 'd10';
    } else if (abilityData.currentDie === 'd10') {
      newCurrent = 'd8';
    } else if (abilityData.currentDie === 'd8') {
      newCurrent = 'd6';
    } else if (abilityData.currentDie === 'd6') {
      newCurrent = 'd4';
    } else if (abilityData.currentDie === 'd4') {
      newCurrent = 'd2';
    } else if (abilityData.currentDie === 'd2') {
      newCurrent = 'd1';
    } else {
      newCurrent = 'd0';
    }
    const result = await this.actor.update({
      [`system.derivedAbilityPools.${abilityName}.currentDie`]: newCurrent
    });
  }

  /* --------------------------------------------
    * Training Status Change 
    * -------------------------------------------- */
  async _onTrainingSelect(event) { 
    event.preventDefault();
    console.log("Training Select", event);
    const element = event.currentTarget;
    const skill = element.name;

    const newTrainingStatus = event.currentTarget.value;

    const actorData = this.actor.system;
    const currentSkill = actorData.skills[skill];
    console.log("Current Skill", currentSkill);

    let dieBase = '';
    let bonusBase = 0;

    console.log("New Training Status", newTrainingStatus);

    if(newTrainingStatus === 'apprentice') {
      dieBase = 'd10';
      bonusBase = 2;
    } else if(newTrainingStatus === 'professional') {
      dieBase = 'd8';
      bonusBase = 4;
    } else if(newTrainingStatus === 'expert') {
      dieBase = 'd6';
      bonusBase = 6;
    } else if(newTrainingStatus === 'master') {
      dieBase = 'd4';
      bonusBase = 8;
    } else if(newTrainingStatus === 'legendary') {
      dieBase = 'd2';
      bonusBase = 10;
    } else {
      dieBase = 'd12';
      bonusBase = 0;
    }

    const totalBase = bonusBase + currentSkill.hindranceMod + currentSkill.traitMod + currentSkill.cyberMod + currentSkill.bioMod;

    await this.actor.update({
      [`system.skills.${skill}.trainingStatus`]: newTrainingStatus,
      [`system.skills.${skill}.die`]: dieBase,
      [`system.skills.${skill}.bonusMod`]: bonusBase,
      [`system.skills.${skill}.totalBonus`]: totalBase,
      [`system.skills.${skill}.isNegBase`]: (totalBase < 0),
    });
  }



}