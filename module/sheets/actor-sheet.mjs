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

    //Increase and Decrease Armor, Equip Armor, and Power Armor
    html.on('click', '.increase-armor', this._onIncreaseArmor.bind(this));
    html.on('click', '.decrease-armor', this._onDecreaseArmor.bind(this));
    html.on('click', '.equip-armor', this._onEquipArmor.bind(this));

    //Equip Weapon
    html.on('click', '.equip-weapon', this._onEquipWeapon.bind(this));

    //Increase and Decrease the Supply
    html.on('click', '.increase-supply', this._onIncreaseSupply.bind(this));
    html.on('click', '.decrease-supply', this._onDecreaseSupply.bind(this));

    //Increase and Decrease Capacity
    html.on('click', '.increase-cap', this._onIncreaseCapacity.bind(this));
    html.on('click', '.decrease-cap', this._onDecreaseCapacity.bind(this));

    // Hide Item Descriptions
    html.on('click', '.hideShowItemDesc', this._rotateExpandTR.bind(this));

    // Switch Tick Mark
    html.on('click', '.switch-tick', this._switchTickMark.bind(this));


    /* --------------------------------------------
     MAGIC WORDS
      -------------------------------------------- */
    //Training Status Change
    html.on('change', '.training-select-word', this._onTrainingSelectWord.bind(this));
    // Switch Tick Mark
    html.on('click', '.switch-tick-word', this._switchTickMarkWord.bind(this));
    // Hide Magic Word Calculations
    html.on('click', '.hide-show-word', this._rotateExpandTRWord.bind(this));
    // Select the Action, Power, or Target Word that is active.
    html.on('click', '.radio-selected-action', this._selectActionWord.bind(this));
    html.on('click', '.radio-selected-power', this._selectPowerWord.bind(this));
    html.on('click', '.radio-selected-target', this._selectTargetWord.bind(this));
    // Radio Buttons for Action Words Armor
    html.on('click', '.radio-selected-armor-ar', this._selectArmorAR.bind(this));
    html.on('click', '.radio-selected-armor-at', this._selectArmorAT.bind(this));
    html.on('click', '.radio-selected-armor-ad', this._selectArmorAD.bind(this));
    // Radio Buttons for Action Words Banish
    html.on('click', '.radio-selected-banish-br', this._selectBanishBR.bind(this));
    html.on('click', '.radio-selected-banish-bs', this._selectBanishBS.bind(this));
    // Radio Buttons for Action Words Control
    html.on('click', '.radio-selected-control-cr', this._selectControlCR.bind(this));
    html.on('click', '.radio-selected-control-cd', this._selectControlCD.bind(this));
    // Radio Buttons for Action Words Create
    html.on('click', '.radio-selected-create-cs', this._selectCreateCS.bind(this));
    html.on('click', '.radio-selected-create-cd', this._selectCreateCD.bind(this));
    // Radio Buttons for Action Words Destroy
    html.on('click', '.radio-selected-destroy-dd', this._selectDestroyDD.bind(this));
    html.on('click', '.radio-selected-destroy-dr', this._selectDestroyDR.bind(this));
    html.on('click', '.radio-selected-destroy-dt', this._selectDestroyDT.bind(this));
    // Radio Buttons for Action Words Repair
    html.on('click', '.radio-selected-repair-rd', this._selectRepairRD.bind(this));
    // Radio Buttons for Action Words Shield
    html.on('click', '.radio-selected-shield-sr', this._selectShieldSR.bind(this));
    html.on('click', '.radio-selected-shield-sd', this._selectShieldSD.bind(this));
    // Radio Buttons for Action Words Summon
    html.on('click', '.radio-selected-summon-ss', this._selectSummonSS.bind(this));
    html.on('click', '.radio-selected-summon-s2', this._selectSummonS2.bind(this));
    html.on('click', '.radio-selected-summon-sd', this._selectSummonSD.bind(this));
    // Radio Buttons for Action Words Transform
    html.on('click', '.radio-selected-transform-ts', this._selectTransformTS.bind(this));
    html.on('click', '.radio-selected-transform-td', this._selectTransformTD.bind(this));
    html.on('click', '.radio-selected-transform-tm', this._selectTransformTM.bind(this));
    // Radio Buttons for Power Words Air
    html.on('click', '.radio-selected-air-ad', this._selectAirAD.bind(this));
    // Radio Buttons for Power Words Animal
    html.on('click', '.radio-selected-animal-ad', this._selectAnimalAD.bind(this));
    html.on('click', '.radio-selected-animal-aa', this._selectAnimalAA.bind(this));
    // Radio Buttons for Power Words Ash
    html.on('click','.radio-selected-ash-ad', this._selectAshAD.bind(this));
    html.on('click','.radio-selected-ash-av', this._selectAshAV.bind(this));
    // Radio Buttons for Power Words Dark
    html.on('click', '.radio-selected-dark-dd', this._selectDarkDD.bind(this));
    html.on('click', '.radio-selected-dark-df', this._selectDarkDF.bind(this));
    // Radio Buttons for Power Words Earth
    html.on('click', '.radio-selected-earth-ed', this._selectEarthED.bind(this));
    // Radio Buttons for Power Words Fire
    html.on('click', '.radio-selected-fire-fd', this._selectFireFD.bind(this));
    // Radio Buttons for Power Words Fissure
    html.on('click', '.radio-selected-fissure-fd', this._selectFissureFD.bind(this));
    html.on('click', '.radio-selected-fissure-fw', this._selectFissureFW.bind(this));
    // Radio Buttons for Power Words Force
    html.on('click', '.radio-selected-force-fd', this._selectForceFD.bind(this));
    // Radio Buttons for Power Words Lava
    html.on('click', '.radio-selected-lava-ld', this._selectLavaLD.bind(this));
    html.on('click', '.radio-selected-lava-lw', this._selectLavaLW.bind(this));
    // Radio Buttons for Power Words Light
    html.on('click', '.radio-selected-light-ld', this._selectLightLD.bind(this));
    html.on('click', '.radio-selected-light-lf', this._selectLightLF.bind(this));
    // Radio Buttons for Power Words Mist
    html.on('click', '.radio-selected-mist-md', this._selectMistMD.bind(this));
    html.on('click', '.radio-selected-mist-mv', this._selectMistMV.bind(this));
    // Radio Buttons for Power Words Mud
    html.on('click', '.radio-selected-mud-md', this._selectMudMD.bind(this));
    html.on('click', '.radio-selected-mud-mm', this._selectMudMM.bind(this));
    // Radio Buttons for Power Words Plant
    html.on('click', '.radio-selected-plant-pd', this._selectPlantPD.bind(this));
    html.on('click', '.radio-selected-plant-pp', this._selectPlantPP.bind(this));
    // Radio Buttons for Power Words Spirit
    html.on('click', '.radio-selected-spirit-sd', this._selectSpiritSD.bind(this));
    // Radio Buttons for Power Words Steam
    html.on('click', '.radio-selected-steam-sd', this._selectSteamSD.bind(this));
    html.on('click', '.radio-selected-steam-sv', this._selectSteamSV.bind(this));
    // Radio Buttons for Power Words Water
    html.on('click', '.radio-selected-water-wd', this._selectWaterWD.bind(this));
    // Radio Buttons for Target Word It
    html.on('click', '.radio-selected-it-it', this._selectItIT.bind(this));
    // Radio Buttons for Target Word Me
    html.on('click', '.radio-selected-me-mt', this._selectMeMT.bind(this));
    // Radio Buttons for Target Word Them
    html.on('click', '.radio-selected-them-tt', this._selectThemTT.bind(this));
    // Radio Buttons for Target Word There
    html.on('click', '.radio-selected-there-tt', this._selectThereTT.bind(this));
    // Radio Buttons for Target Word Us
    html.on('click', '.radio-selected-us-ut', this._selectUsUT.bind(this));
    // Radio Buttons for Target Word You
    html.on('click', '.radio-selected-you-yt', this._selectYouYT.bind(this));
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
      let modifier = 0;
      const d = new Dialog({
        title: "Roll Dialog",
        content: `<h3>Choose roll type</h3>`,
        buttons: {
          one: {
            icon: '<i class="fas fa-arrow-up"></i>',
            label: `Upgraded<br/>${uproll}+${modifier}`,
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
        render: (html) => {
          console.log("Render", html);
          console.log("Modifier", modifier);
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
    console.log("SKILL", skill)

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
    console.log("HERE");
    await this.actor.update({
      [`system.skills.${skill}.trainingStatus`]: newTrainingStatus,
      [`system.skills.${skill}.die`]: dieBase,
      [`system.skills.${skill}.bonusMod`]: bonusBase,
      [`system.skills.${skill}.totalBonus`]: totalBase,
      [`system.skills.${skill}.isNegBase`]: (totalBase < 0),
      [`system.skills.${skill}.usageTickSucc0`]: false,
      [`system.skills.${skill}.usageTickSucc1`]: false,
      [`system.skills.${skill}.usageTickSucc2`]: false,
      [`system.skills.${skill}.usageTickSucc3`]: false,
      [`system.skills.${skill}.usageTickSucc4`]: false,
      [`system.skills.${skill}.usageTickSucc5`]: false,
      [`system.skills.${skill}.usageTickSucc6`]: false,
      [`system.skills.${skill}.usageTickSucc7`]: false,
      [`system.skills.${skill}.usageTickSucc8`]: false,
      [`system.skills.${skill}.usageTickSucc9`]: false,
    });
  }

  /* --------------------------------------------
    * Item Armor Increase and Decrease, Equip also
    * -------------------------------------------- */
  async _onIncreaseArmor(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
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
    if(mapping[item.system.armorCurrentDie] < mapping[item.system.armorDie] && item.system.armorCurrentDie === 'd0') {
      newCurrent = 'd1';
    } else if(mapping[item.system.armorCurrentDie] < mapping[item.system.armorDie] && item.system.armorCurrentDie === 'd1') {
      newCurrent = 'd2';
    } else if(mapping[item.system.armorCurrentDie] < mapping[item.system.armorDie] && item.system.armorCurrentDie === 'd2') {
      newCurrent = 'd4';
    } else if(mapping[item.system.armorCurrentDie] < mapping[item.system.armorDie] && item.system.armorCurrentDie === 'd4') {
      newCurrent = 'd6';
    } else if(mapping[item.system.armorCurrentDie] < mapping[item.system.armorDie] && item.system.armorCurrentDie === 'd6') {
      newCurrent = 'd8';
    } else if(mapping[item.system.armorCurrentDie] < mapping[item.system.armorDie] && item.system.armorCurrentDie === 'd8') {
      newCurrent = 'd10';
    } else if(mapping[item.system.armorCurrentDie] < mapping[item.system.armorDie] && item.system.armorCurrentDie === 'd10') {
      newCurrent = 'd12';
    } else {
      newCurrent = item.system.armorCurrentDie;
    }

    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.armorCurrentDie`]: newCurrent
    });
  }
  async _onDecreaseArmor(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);

    let newCurrent = 'd12';
    if(item.system.armorCurrentDie === 'd12') {
      newCurrent = 'd10';
    } else if (item.system.armorCurrentDie === 'd10') {
      newCurrent = 'd8';
    } else if (item.system.armorCurrentDie === 'd8') {
      newCurrent = 'd6';
    } else if (item.system.armorCurrentDie === 'd6') {
      newCurrent = 'd4';
    } else if (item.system.armorCurrentDie === 'd4') {
      newCurrent = 'd2';
    } else if (item.system.armorCurrentDie === 'd2') {
      newCurrent = 'd1';
    } else {
      newCurrent = 'd0';
    }

    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.armorCurrentDie`]: newCurrent
    });
  }
  async _onEquipArmor(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);

    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.worn`]: !item.system.worn
    });
  }
  async _onEquipWeapon(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);

    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.equipped`]: !item.system.equipped
    });
  }

  /* --------------------------------------------
    * Supply Increase and Decrease
    * -------------------------------------------- */
  async _onIncreaseSupply(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
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
    if(mapping[item.system.supplyCurrentDie] < mapping[item.system.supplyDie] && item.system.supplyCurrentDie === 'd0') {
      newCurrent = 'd1';
    } else if(mapping[item.system.supplyCurrentDie] < mapping[item.system.supplyDie] && item.system.supplyCurrentDie === 'd1') {
      newCurrent = 'd2';
    } else if(mapping[item.system.supplyCurrentDie] < mapping[item.system.supplyDie] && item.system.supplyCurrentDie === 'd2') {
      newCurrent = 'd4';
    } else if(mapping[item.system.supplyCurrentDie] < mapping[item.system.supplyDie] && item.system.supplyCurrentDie === 'd4') {
      newCurrent = 'd6';
    } else if(mapping[item.system.supplyCurrentDie] < mapping[item.system.supplyDie] && item.system.supplyCurrentDie === 'd6') {
      newCurrent = 'd8';
    } else if(mapping[item.system.supplyCurrentDie] < mapping[item.system.supplyDie] && item.system.supplyCurrentDie === 'd8') {
      newCurrent = 'd10';
    } else if(mapping[item.system.supplyCurrentDie] < mapping[item.system.supplyDie] && item.system.supplyCurrentDie === 'd10') {
      newCurrent = 'd12';
    } else {
      newCurrent = item.system.supplyCurrentDie;
    }
  
    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.supplyCurrentDie`]: newCurrent
    });
  }
  async _onDecreaseSupply(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
  
    let newCurrent = 'd12';
    if(item.system.supplyCurrentDie === 'd12') {
      newCurrent = 'd10';
    } else if (item.system.supplyCurrentDie === 'd10') {
      newCurrent = 'd8';
    } else if (item.system.supplyCurrentDie === 'd8') {
      newCurrent = 'd6';
    } else if (item.system.supplyCurrentDie === 'd6') {
      newCurrent = 'd4';
    } else if (item.system.supplyCurrentDie === 'd4') {
      newCurrent = 'd2';
    } else if (item.system.supplyCurrentDie === 'd2') {
      newCurrent = 'd1';
    } else {
      newCurrent = 'd0';
    }
  
    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.supplyCurrentDie`]: newCurrent
    });
  }

  /* --------------------------------------------
    * Capacity Increase and Decrease
    * -------------------------------------------- */
  async _onIncreaseCapacity(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.curCapacity`]: item.system.capacity
    });
  }
  async _onDecreaseCapacity(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    let newValue = item.system.curCapacity - 1;
    if (newValue < 0) {
      newValue = 0;
    }
    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.curCapacity`]: newValue
    });
  }

  /* --------------------------------------------
    * Hide Item Descriptions
    * -------------------------------------------- */
  async _rotateExpandTR(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    console.log("ITEM", item)

    const hs = item.system.hideShow === 'none' ? 'table-row' : 'none';
    const r = item.system.rotate === 'fa-caret-down' ? 'fa-caret-right' : 'fa-caret-down';
    console.log("ROTATE", r);
    console.log("HIDE", hs);
    await this.actor.items.get(event.currentTarget.dataset.itemId).update({
      [`system.rotate`]: r,
      [`system.hideShow`]: hs
    })
  }

  /* --------------------------------------------
    * Switch Tick Mark
    * -------------------------------------------- */
  async _switchTickMark(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const system = this.actor.system;
    const result = await this.actor.update({
      [`system.skills.${data.skill}.${data.tick}`]: !system.skills[data.skill][data.tick]
    })
    console.log("RESULT", result)
  }

  /* --------------------------------------------
    MAGIC WORDS
  -------------------------------------------- */
  /* --------------------------------------------
  * Switch Tick Mark - Word
  * -------------------------------------------- */
  async _switchTickMarkWord(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const system = this.actor.system;

    const result = await this.actor.update({
      [`system.${data.wordtype}.${data.word}.${data.tick}`]: !system[data.wordtype][data.word][data.tick]
    })
    console.log("RESULT", result)
  }

  /* --------------------------------------------
    * Training Status Change - Word
    * -------------------------------------------- */
  async _onTrainingSelectWord(event) { 
    event.preventDefault();
    console.log("Training Select Word", event);
    const element = event.currentTarget;
    const word = element.name;
    const wordtype = element.dataset.wordtype;
    console.log("Word", word)


    const newTrainingStatus = event.currentTarget.value;

    const actorData = this.actor.system;
    const currentWord = actorData[wordtype][word];
    console.log("Current word", currentWord);

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

    const totalBase = bonusBase + currentWord.hindranceMod + currentWord.traitMod + currentWord.cyberMod + currentWord.bioMod;
    console.log("HERE");
    await this.actor.update({
      [`system.${wordtype}.${word}.trainingStatus`]: newTrainingStatus,
      [`system.${wordtype}.${word}.die`]: dieBase,
      [`system.${wordtype}.${word}.bonusMod`]: bonusBase,
      [`system.${wordtype}.${word}.totalBonus`]: totalBase,
      [`system.${wordtype}.${word}.isNegBase`]: (totalBase < 0),
      [`system.${wordtype}.${word}.usageTickSucc0`]: false,
      [`system.${wordtype}.${word}.usageTickSucc1`]: false,
      [`system.${wordtype}.${word}.usageTickSucc2`]: false,
      [`system.${wordtype}.${word}.usageTickSucc3`]: false,
      [`system.${wordtype}.${word}.usageTickSucc4`]: false,
      [`system.${wordtype}.${word}.usageTickSucc5`]: false,
      [`system.${wordtype}.${word}.usageTickSucc6`]: false,
      [`system.${wordtype}.${word}.usageTickSucc7`]: false,
      [`system.${wordtype}.${word}.usageTickSucc8`]: false,
      [`system.${wordtype}.${word}.usageTickSucc9`]: false,
    });
  }
  /* --------------------------------------------
    * Hide Word Calculations
    * -------------------------------------------- */
  async _rotateExpandTRWord(event) {
    event.preventDefault();
    console.log("EVENT", event);
    console.log("ACTOR", this.actor);
    const wordtype = event.currentTarget.dataset.wordtype;
    const word = event.currentTarget.dataset.label.toLowerCase();
    
    const hs = this.actor.system[wordtype][word].hideShow === 'none' ? 'table-row' : 'none';
    const r = this.actor.system[wordtype][word].rotate === 'fa-caret-down' ? 'fa-caret-right' : 'fa-caret-down';
    console.log("ROTATE", r);
    console.log("HIDE", hs);
    const result = await this.actor.update({
      [`system.${wordtype}.${word}.rotate`]: r,
      [`system.${wordtype}.${word}.hideShow`]: hs
    })
  }
  /* --------------------------------------------
    * Select Action Word
    * -------------------------------------------- */
  async _selectActionWord(event) {
    event.preventDefault();
    console.log("SELECT ACTION WORD", event);
    const word = event.currentTarget.dataset.word;
    const costWord = event.currentTarget.dataset.wordCost;
    console.log("WORD", word);
    const result = await this.actor.update({
      [`system.currentWordSelection.actionWord`]: word,
    })
  }
  async _selectPowerWord(event) {
    event.preventDefault();
    console.log("SELECT POWER WORD", event);
    const word = event.currentTarget.dataset.word;
    const costWord = event.currentTarget.dataset.wordCost;
    console.log("WORD", word);
    const result = await this.actor.update({
      [`system.currentWordSelection.powerWord`]: word,
    })
  }
  async _selectTargetWord(event) {
    event.preventDefault();
    console.log("SELECT TARGET WORD", event);
    const word = event.currentTarget.dataset.word;
    const costWord = event.currentTarget.dataset.wordCost;
    console.log("WORD", word);
    const result = await this.actor.update({
      [`system.currentWordSelection.targetWord`]: word,
    })
  }

  /* --------------------------------------------
    * Handle Magic Word Armor Radio Buttons
    * -------------------------------------------- */
  async _selectArmorAR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    console.log("DATA", data);
    const total = Number(data.cost) + this.actor.system.wordCosts.wordArmor.costType + this.actor.system.wordCosts.wordArmor.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordArmor.costRating`]: data.cost,
      [`system.wordCosts.wordArmor.costTotal`]: total
    })
  }
  async _selectArmorAT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    console.log("DATA", data);
    const total =  Number(data.cost) +this.actor.system.wordCosts.wordArmor.costRating + this.actor.system.wordCosts.wordArmor.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordArmor.costType`]: data.cost,
      [`system.wordCosts.wordArmor.costTotal`]: total
    })
  }
  async _selectArmorAD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    console.log("DATA", data);
    const total = Number(data.cost) + this.actor.system.wordCosts.wordArmor.costRating + this.actor.system.wordCosts.wordArmor.costType;
    await this.actor.update({
      [`system.wordCosts.wordArmor.costDuration`]: data.cost,
      [`system.wordCosts.wordArmor.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Banish Radio Buttons
    * -------------------------------------------- */
  async _selectBanishBR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    console.log("DATA", data);
    const total = Number(data.cost) + this.actor.system.wordCosts.wordBanish.costSize;
    await this.actor.update({
      [`system.wordCosts.wordBanish.costResistance`]: data.cost,
      [`system.wordCosts.wordBanish.costTotal`]: total
    })
  }
  async _selectBanishBS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    console.log("DATA", data);
    const total = Number(data.cost) + this.actor.system.wordCosts.wordBanish.costResistance;
    await this.actor.update({
      [`system.wordCosts.wordBanish.costSize`]: data.cost,
      [`system.wordCosts.wordBanish.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Control Radio Buttons
    * -------------------------------------------- */
  async _selectControlCR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    console.log("DATA", data);
    const total = Number(data.cost) + this.actor.system.wordCosts.wordControl.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordControl.costResistance`]: data.cost,
      [`system.wordCosts.wordControl.costTotal`]: total
    })
  }
  async _selectControlCD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    console.log("DATA", data);
    const total = Number(data.cost) + this.actor.system.wordCosts.wordControl.costResistance;
    await this.actor.update({
      [`system.wordCosts.wordControl.costDuration`]: data.cost,
      [`system.wordCosts.wordControl.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Create Radio Buttons
    * -------------------------------------------- */
  async _selectCreateCS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordCreate.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordCreate.costSize`]: data.cost,
      [`system.wordCosts.wordCreate.costTotal`]: total
    })
  }
  async _selectCreateCD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordCreate.costSize;
    await this.actor.update({
      [`system.wordCosts.wordCreate.costDuration`]: data.cost,
      [`system.wordCosts.wordCreate.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Destroy Radio Buttons
    * -------------------------------------------- */
  async _selectDestroyDD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordDestroy.costResistance + this.actor.system.wordCosts.wordDestroy.costType;
    await this.actor.update({
      [`system.wordCosts.wordDestroy.costDamage`]: data.cost,
      [`system.wordCosts.wordDestroy.costTotal`]: total
    })
  }
  async _selectDestroyDR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordDestroy.costDamage + this.actor.system.wordCosts.wordDestroy.costType;
    await this.actor.update({
      [`system.wordCosts.wordDestroy.costResistance`]: data.cost,
      [`system.wordCosts.wordDestroy.costTotal`]: total
    })
  }
  async _selectDestroyDT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordDestroy.costDamage + this.actor.system.wordCosts.wordDestroy.costResistance;
    await this.actor.update({
      [`system.wordCosts.wordDestroy.costType`]: data.cost,
      [`system.wordCosts.wordDestroy.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Repair Radio Buttons
    * -------------------------------------------- */
  async _selectRepairRD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordRepair.costRepair`]: data.cost,
      [`system.wordCosts.wordRepair.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Shield Radio Buttons
    * -------------------------------------------- */
  async _selectShieldSR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordShield.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordShield.costResist`]: data.cost,
      [`system.wordCosts.wordShield.costTotal`]: total
    })
  }
  async _selectShieldSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordShield.costResist;
    await this.actor.update({
      [`system.wordCosts.wordShield.costDuration`]: data.cost,
      [`system.wordCosts.wordShield.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Summon Radio Buttons
    * -------------------------------------------- */
  async _selectSummonSS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordSummon.costStays + this.actor.system.wordCosts.wordSummon.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordSummon.costSize`]: data.cost,
      [`system.wordCosts.wordSummon.costTotal`]: total
    })
  }
  async _selectSummonS2(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordSummon.costSize + this.actor.system.wordCosts.wordSummon.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordSummon.costStays`]: data.cost,
      [`system.wordCosts.wordSummon.costTotal`]: total
    })
  }
  async _selectSummonSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordSummon.costSize + this.actor.system.wordCosts.wordSummon.costStays;
    await this.actor.update({
      [`system.wordCosts.wordSummon.costDuration`]: data.cost,
      [`system.wordCosts.wordSummon.costTotal`]: total
    })
  }

  /* --------------------------------------------
    * Handle Magic Word Transform Radio Buttons
    * -------------------------------------------- */
  async _selectTransformTS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordTransform.costDuration + this.actor.system.wordCosts.wordTransform.costMental + this.actor.system.wordCosts.wordTransform.costSize;
    await this.actor.update({
      [`system.wordCosts.wordTransform.costSize`]: data.cost,
      [`system.wordCosts.wordTransform.costTotal`]: total
    })
  }
  async _selectTransformTD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordTransform.costSize + this.actor.system.wordCosts.wordTransform.costMental + this.actor.system.wordCosts.wordTransform.costDuration;
    await this.actor.update({
      [`system.wordCosts.wordTransform.costDuration`]: data.cost,
      [`system.wordCosts.wordTransform.costTotal`]: total
    })
  }
  async _selectTransformTM(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordTransform.costSize + this.actor.system.wordCosts.wordTransform.costDuration + this.actor.system.wordCosts.wordTransform.costMental;
    await this.actor.update({
      [`system.wordCosts.wordTransform.costMental`]: data.cost,
      [`system.wordCosts.wordTransform.costTotal`]: total
    })
  }

  /* --------------------------------------------
    * Handle Magic Word Air Radio Buttons
    * -------------------------------------------- */
  async _selectAirAD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const result = await this.actor.update({
      [`system.wordCosts.wordAir.costDamage`]: data.cost,
      [`system.wordCosts.wordAir.costTotal`]: data.cost
    })
    console.log("RESULT", result);
  }
  /* --------------------------------------------
    * Handle Magic Word Animal Radio Buttons
    * -------------------------------------------- */
  async _selectAnimalAD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordAnimal.costAnimal;
    await this.actor.update({
      [`system.wordCosts.wordAnimal.costDamage`]: data.cost,
      [`system.wordCosts.wordAnimal.costTotal`]: total
    })
  }
  async _selectAnimalAA(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordAnimal.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordAnimal.costAnimal`]: data.cost,
      [`system.wordCosts.wordAnimal.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Ash Radio Buttons
    * -------------------------------------------- */
  async _selectAshAD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordAsh.costVisibility;
    await this.actor.update({
      [`system.wordCosts.wordAsh.costDamage`]: data.cost,
      [`system.wordCosts.wordAsh.costTotal`]: total
    })
  }
  async _selectAshAV(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordAsh.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordAsh.costVisibility`]: data.cost,
      [`system.wordCosts.wordAsh.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Dark Radio Buttons
    * -------------------------------------------- */
  async _selectDarkDD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordDark.costField;
    await this.actor.update({
      [`system.wordCosts.wordDark.costDamage`]: data.cost,
      [`system.wordCosts.wordDark.costTotal`]: total
    })
  }
  async _selectDarkDF(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordDark.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordDark.costField`]: data.cost,
      [`system.wordCosts.wordDark.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Earth Radio Buttons
    * -------------------------------------------- */
  async _selectEarthED(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordEarth.costDamage`]: data.cost,
      [`system.wordCosts.wordEarth.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Fire Radio Buttons
    * -------------------------------------------- */
  async _selectFireFD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordFire.costDamage`]: data.cost,
      [`system.wordCosts.wordFire.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Fissure Radio Buttons
    * -------------------------------------------- */
  async _selectFissureFD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordFissure.costWeaken;
    await this.actor.update({
      [`system.wordCosts.wordFissure.costDamage`]: data.cost,
      [`system.wordCosts.wordFissure.costTotal`]: total
    })
  }
  async _selectFissureFW(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordFissure.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordFissure.costWeaken`]: data.cost,
      [`system.wordCosts.wordFissure.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Force Radio Buttons
    * -------------------------------------------- */
  async _selectForceFD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordForce.costDamage`]: data.cost,
      [`system.wordCosts.wordForce.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Lava Radio Buttons
    * -------------------------------------------- */
  async _selectLavaLD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordLava.costWeaken;
    await this.actor.update({
      [`system.wordCosts.wordLava.costDamage`]: data.cost,
      [`system.wordCosts.wordLava.costTotal`]: total
    })
  }
  async _selectLavaLW(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordLava.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordLava.costWeaken`]: data.cost,
      [`system.wordCosts.wordLava.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Light Radio Buttons
    * -------------------------------------------- */
  async _selectLightLD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordLight.costField;
    await this.actor.update({
      [`system.wordCosts.wordLight.costDamage`]: data.cost,
      [`system.wordCosts.wordLight.costTotal`]: total
    })
  }
  async _selectLightLF(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordLight.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordLight.costField`]: data.cost,
      [`system.wordCosts.wordLight.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Mist Radio Buttons
    * -------------------------------------------- */
  async _selectMistMD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordMist.costVisibility;
    await this.actor.update({
      [`system.wordCosts.wordMist.costDamage`]: data.cost,
      [`system.wordCosts.wordMist.costTotal`]: total
    })
  }
  async _selectMistMV(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordMist.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordMist.costVisibility`]: data.cost,
      [`system.wordCosts.wordMist.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Mud Radio Buttons
    * -------------------------------------------- */
  async _selectMudMD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordMud.costMovevment;
    await this.actor.update({
      [`system.wordCosts.costMud.costDamage`]: data.cost,
      [`system.wordCosts.costMud.costTotal`]: total
    })
  }
  async _selectMudMM(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.costMud.costDamage;
    await this.actor.update({
      [`system.wordCosts.costMud.costMovevment`]: data.cost,
      [`system.wordCosts.costMud.costTotal`]: total  
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Plant Radio Buttons
    * -------------------------------------------- */
  async _selectPlantPD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordPlant.costPlant;
    await this.actor.update({
      [`system.wordCosts.wordPlant.costDamage`]: data.cost,
      [`system.wordCosts.wordPlant.costTotal`]: total
    })
  }
  async _selectPlantPP(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordPlant.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordPlant.costPlant`]: data.cost,
      [`system.wordCosts.wordPlant.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Spirit Radio Buttons
    * -------------------------------------------- */
  async _selectSpiritSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordSpirit.costDamage`]: data.cost,
      [`system.wordCosts.wordSpirit.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Steam Radio Buttons
    * -------------------------------------------- */
  async _selectSteamSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordSteam.costVisibility;
    await this.actor.update({
      [`system.wordCosts.wordSteam.costDamage`]: data.cost,
      [`system.wordCosts.wordSteam.costTotal`]: total
    })
  }
  async _selectSteamSV(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordSteam.costDamage;
    await this.actor.update({
      [`system.wordCosts.wordSteam.costVisibility`]: data.cost,
      [`system.wordCosts.wordSteam.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Water Radio Buttons
    * -------------------------------------------- */
  async _selectWaterWD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordWater.costDamage`]: data.cost,
      [`system.wordCosts.wordWater.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word It Radio Buttons
    * -------------------------------------------- */
  async _selectItIT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordIt.costTarget`]: data.cost,
      [`system.wordCosts.wordIt.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Me Radio Buttons
    * -------------------------------------------- */
  async _selectMeMT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordMe.costTarget`]: data.cost,
      [`system.wordCosts.wordMe.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Them Radio Buttons
    * -------------------------------------------- */
  async _selectThemTT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordThem.costTarget`]: data.cost,
      [`system.wordCosts.wordThem.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word There Radio Buttons
    * -------------------------------------------- */
  async _selectThereTT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordThere.costTarget`]: data.cost,
      [`system.wordCosts.wordThere.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word Us Radio Buttons
    * -------------------------------------------- */
  async _selectUsUT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordUs.costTarget`]: data.cost,
      [`system.wordCosts.wordUs.costTotal`]: data.cost
    })
  }
  /* --------------------------------------------
    * Handle Magic Word You Radio Buttons
    * -------------------------------------------- */
  async _selectYouYT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    await this.actor.update({
      [`system.wordCosts.wordYou.costTarget`]: data.cost,
      [`system.wordCosts.wordYou.costTotal`]: data.cost
    })
  }
}
