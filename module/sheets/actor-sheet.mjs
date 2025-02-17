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
    html.on('click', '.radio-selected-repair-rs', this._selectRepairRS.bind(this));
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
    // Radio Buttons for Power Words Dark
    html.on('click', '.radio-selected-dark-dd', this._selectDarkDD.bind(this));
    html.on('click', '.radio-selected-dark-df', this._selectDarkDF.bind(this));
    // Radio Buttons for Power Words Earth
    html.on('click', '.radio-selected-earth-ed', this._selectEarthED.bind(this));
    // Radio Buttons for Power Words Fire
    html.on('click', '.radio-selected-fire-fd', this._selectFireFD.bind(this));
    // Radio Buttons for Power Words Force
    html.on('click', '.radio-selected-force-fd', this._selectForceFD.bind(this));
    // Radio Buttons for Power Words Light
    html.on('click', '.radio-selected-light-ld', this._selectLightLD.bind(this));
    html.on('click', '.radio-selected-light-lf', this._selectLightLF.bind(this));
    // Radio Buttons for Power Words Plant
    html.on('click', '.radio-selected-plant-pd', this._selectPlantPD.bind(this));
    html.on('click', '.radio-selected-plant-pp', this._selectPlantPP.bind(this));
    // Radio Buttons for Power Words Spirit
    html.on('click', '.radio-selected-spirit-sd', this._selectSpiritSD.bind(this));
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

    /* --------------------------------------------
     Psychic Powers
      -------------------------------------------- */
    //Training Status Change
    html.on('change', '.training-select-psychic', this._onTrainingSelectPsychic.bind(this));
    // Switch Tick Mark
    html.on('click', '.switch-tick-psychic', this._switchTickMarkPsychic.bind(this));
    // Select Psychic Power
    html.on('click', '.radio-selected-psychic', this._selectPsychicPower.bind(this));
    // Hide Psychic Calculations
    html.on('click', '.hide-show-psychic', this._rotateExpandTRPsychic.bind(this));
    // Psychic Confusion Radio Buttons
    html.on('click', '.radio-psychic-selected-confusion-cb', this._selectPsychicConfusionCB.bind(this));
    html.on('click', '.radio-psychic-selected-confusion-cr', this._selectPsychicConfusionCR.bind(this));
    html.on('click', '.radio-psychic-selected-confusion-ct', this._selectPsychicConfusionCT.bind(this));
    html.on('click', '.radio-psychic-selected-confusion-cd', this._selectPsychicConfusionCD.bind(this));
    // Psychic Charm Radio Buttons
    html.on('click', '.radio-psychic-selected-charm-cb', this._selectPsychicCharmCB.bind(this));
    html.on('click', '.radio-psychic-selected-charm-cr', this._selectPsychicCharmCR.bind(this));
    html.on('click', '.radio-psychic-selected-charm-ct', this._selectPsychicCharmCT.bind(this));
    html.on('click', '.radio-psychic-selected-charm-cd', this._selectPsychicCharmCD.bind(this));
    // Psychic Dominate Radio Buttons
    html.on('click', '.radio-psychic-selected-dominate-db', this._selectPsychicDominateDB.bind(this));
    html.on('click', '.radio-psychic-selected-dominate-dr', this._selectPsychicDominateDR.bind(this));
    html.on('click', '.radio-psychic-selected-dominate-dt', this._selectPsychicDominateDT.bind(this));
    html.on('click', '.radio-psychic-selected-dominate-dd', this._selectPsychicDominateDD.bind(this));
    // Psychic Locate Power Radio Buttons
    html.on('click', '.radio-psychic-selected-locatepower-lb', this._selectPsychicLocatePowerLB.bind(this));
    html.on('click', '.radio-psychic-selected-locatepower-ld', this._selectPsychicLocatePowerLD.bind(this));
    html.on('click', '.radio-psychic-selected-locatepower-lt', this._selectPsychicLocatePowerLT.bind(this));
    // Psychic Locate Thing Radio Buttons
    html.on('click', '.radio-psychic-selected-locatething-lb', this._selectPsychicLocateThingLB.bind(this));
    html.on('click', '.radio-psychic-selected-locatething-ld', this._selectPsychicLocateThingLD.bind(this));
    html.on('click', '.radio-psychic-selected-locatething-lt', this._selectPsychicLocateThingLT.bind(this));
    // Psychic Locate Person Radio Buttons
    html.on('click', '.radio-psychic-selected-locateperson-lb', this._selectPsychicLocatePersonLB.bind(this));
    html.on('click', '.radio-psychic-selected-locateperson-lr', this._selectPsychicLocatePersonLR.bind(this));
    html.on('click', '.radio-psychic-selected-locateperson-ld', this._selectPsychicLocatePersonLD.bind(this));
    html.on('click', '.radio-psychic-selected-locateperson-lt', this._selectPsychicLocatePersonLT.bind(this));
    // Psychic Drain Recharge Radio Buttons
    html.on('click', '.radio-psychic-selected-drainrecharge-db', this._selectPsychicDrainRechargeDB.bind(this));
    html.on('click', '.radio-psychic-selected-drainrecharge-dr', this._selectPsychicDrainRechargeDR.bind(this));
    html.on('click', '.radio-psychic-selected-drainrecharge-dt', this._selectPsychicDrainRechargeDT.bind(this));
    // Psychic Throw Electrical Radio Buttons
    html.on('click', '.radio-psychic-selected-throwelectrical-tb', this._selectPsychicThrowElectricalTB.bind(this));
    html.on('click', '.radio-psychic-selected-throwelectrical-tr', this._selectPsychicThrowElectricalTR.bind(this));
    html.on('click', '.radio-psychic-selected-throwelectrical-tt', this._selectPsychicThrowElectricalTT.bind(this));
    html.on('click', '.radio-psychic-selected-throwelectrical-tn', this._selectPsychicThrowElectricalTN.bind(this));
    html.on('click', '.radio-psychic-selected-throwelectrical-td', this._selectPsychicThrowElectricalTD.bind(this));
    html.on('click', '.radio-psychic-selected-throwelectrical-th', this._selectPsychicThrowElectricalTH.bind(this));
    // Psychic Shield Electrical Radio Buttons
    html.on('click', '.radio-psychic-selected-shieldelectrical-sb', this._selectPsychicShieldElectricalSB.bind(this));
    html.on('click', '.radio-psychic-selected-shieldelectrical-sa', this._selectPsychicShieldElectricalSA.bind(this));
    html.on('click', '.radio-psychic-selected-shieldelectrical-sh', this._selectPsychicShieldElectricalSH.bind(this));
    html.on('click', '.radio-psychic-selected-shieldelectrical-sd', this._selectPsychicShieldElectricalSD.bind(this));
    // Psychic Calm Emotions Radio Buttons
    html.on('click', '.radio-psychic-selected-calmemotions-cb', this._selectPsychicCalmEmotionsCB.bind(this));
    html.on('click', '.radio-psychic-selected-calmemotions-cr', this._selectPsychicCalmEmotionsCR.bind(this));
    html.on('click', '.radio-psychic-selected-calmemotions-ct', this._selectPsychicCalmEmotionsCT.bind(this));
    // Psychic Boster Emotions Radio Buttons
    html.on('click', '.radio-psychic-selected-bolsteremotions-bb', this._selectPsychicBolsterEmotionsBB.bind(this));
    html.on('click', '.radio-psychic-selected-bolsteremotions-bc', this._selectPsychicBolsterEmotionsBC.bind(this));
    html.on('click', '.radio-psychic-selected-bolsteremotions-bt', this._selectPsychicBolsterEmotionsBT.bind(this));
    // Psychic Healing Radio Buttons
    html.on('click', '.radio-psychic-selected-healing-hb', this._selectPsychicHealingHB.bind(this));
    html.on('click', '.radio-psychic-selected-healing-hh', this._selectPsychicHealingHH.bind(this));
    html.on('click', '.radio-psychic-selected-healing-ht', this._selectPsychicHealingHT.bind(this));
    // Psychic Create Evaporate Water Radio Buttons
    html.on('click', '.radio-psychic-selected-createevaporatewater-cb', this._selectPsychicCreateEvaporateWaterCB.bind(this));
    html.on('click', '.radio-psychic-selected-createevaporatewater-cr', this._selectPsychicCreateEvaporateWaterCR.bind(this));
    html.on('click', '.radio-psychic-selected-createevaporatewater-ct', this._selectPsychicCreateEvaporateWaterCT.bind(this));
    // Psychic Throw Water Radio Buttons
    html.on('click', '.radio-psychic-selected-throwwater-tb', this._selectPsychicThrowWaterTB.bind(this));
    html.on('click', '.radio-psychic-selected-throwwater-tr', this._selectPsychicThrowWaterTR.bind(this));
    html.on('click', '.radio-psychic-selected-throwwater-tt', this._selectPsychicThrowWaterTT.bind(this));
    html.on('click', '.radio-psychic-selected-throwwater-th', this._selectPsychicThrowWaterTH.bind(this));
    html.on('click', '.radio-psychic-selected-throwwater-tn', this._selectPsychicThrowWaterTN.bind(this));
    html.on('click', '.radio-psychic-selected-throwwater-td', this._selectPsychicThrowWaterTD.bind(this));
    // Psychic Engulf Radio Buttons
    html.on('click', '.radio-psychic-selected-engulf-eb', this._selectPsychicEngulfEB.bind(this));
    html.on('click', '.radio-psychic-selected-engulf-er', this._selectPsychicEngulfER.bind(this));
    html.on('click', '.radio-psychic-selected-engulf-et', this._selectPsychicEngulfET.bind(this));
    html.on('click', '.radio-psychic-selected-engulf-ed', this._selectPsychicEngulfED.bind(this));
    // Psychic Illusion Radio Buttons
    html.on('click', '.radio-psychic-selected-illusion-ib', this._selectPsychicIllusionIB.bind(this));
    html.on('click', '.radio-psychic-selected-illusion-ir', this._selectPsychicIllusionIR.bind(this));
    html.on('click', '.radio-psychic-selected-illusion-id', this._selectPsychicIllusionID.bind(this));
    html.on('click', '.radio-psychic-selected-illusion-it', this._selectPsychicIllusionIT.bind(this));
    // Psychic Wipe Radio Buttons
    html.on('click', '.radio-psychic-selected-wipe-wb', this._selectPsychicWipeWB.bind(this));
    html.on('click', '.radio-psychic-selected-wipe-wr', this._selectPsychicWipeWR.bind(this));
    html.on('click', '.radio-psychic-selected-wipe-wh', this._selectPsychicWipeWH.bind(this));
    html.on('click', '.radio-psychic-selected-wipe-wd', this._selectPsychicWipeWD.bind(this));
    html.on('click', '.radio-psychic-selected-wipe-wt', this._selectPsychicWipeWT.bind(this));
    // Psychic Modify Radio Buttons
    html.on('click', '.radio-psychic-selected-modify-mb', this._selectPsychicModifyMB.bind(this));
    html.on('click', '.radio-psychic-selected-modify-mr', this._selectPsychicModifyMR.bind(this));
    html.on('click', '.radio-psychic-selected-modify-mh', this._selectPsychicModifyMH.bind(this));
    html.on('click', '.radio-psychic-selected-modify-md', this._selectPsychicModifyMD.bind(this));
    html.on('click', '.radio-psychic-selected-modify-mt', this._selectPsychicModifyMT.bind(this));
    // Psychic Light Radio Buttons
    html.on('click', '.radio-psychic-selected-light-lb', this._selectPsychicLightLB.bind(this));
    html.on('click', '.radio-psychic-selected-light-lr', this._selectPsychicLightLR.bind(this));
    html.on('click', '.radio-psychic-selected-light-ld', this._selectPsychicLightLD.bind(this));
    // Psychic Project Blades Radio Buttons
    html.on('click', '.radio-psychic-selected-projectblades-pb', this._selectPsychicProjectBladesPB.bind(this));
    html.on('click', '.radio-psychic-selected-projectblades-pw', this._selectPsychicProjectBladesPW.bind(this));
    html.on('click', '.radio-psychic-selected-projectblades-ph', this._selectPsychicProjectBladesPH.bind(this));
    html.on('click', '.radio-psychic-selected-projectblades-pd', this._selectPsychicProjectBladesPD.bind(this));
    html.on('click', '.radio-psychic-selected-projectblades-pc', this._selectPsychicProjectBladesPC.bind(this));
    // Psychic Project Pain Radio Buttons
    html.on('click', '.radio-psychic-selected-projectpain-pb', this._selectPsychicProjectPainPB.bind(this));
    html.on('click', '.radio-psychic-selected-projectpain-pr', this._selectPsychicProjectPainPR.bind(this));
    html.on('click', '.radio-psychic-selected-projectpain-pt', this._selectPsychicProjectPainPT.bind(this));
    html.on('click', '.radio-psychic-selected-projectpain-ph', this._selectPsychicProjectPainPH.bind(this));
    html.on('click', '.radio-psychic-selected-projectpain-pn', this._selectPsychicProjectPainPN.bind(this));
    html.on('click', '.radio-psychic-selected-projectpain-pd', this._selectPsychicProjectPainPD.bind(this));
    // Psychic Control Fires Radio Buttons
    html.on('click', '.radio-psychic-selected-controlfire-cb', this._selectPsychicControlFireCB.bind(this));
    html.on('click', '.radio-psychic-selected-controlfire-cr', this._selectPsychicControlFireCR.bind(this));
    html.on('click', '.radio-psychic-selected-controlfire-ct', this._selectPsychicControlFireCT.bind(this));
    // Psychic Throw Fires Radio Buttons
    html.on('click', '.radio-psychic-selected-throwfire-tb', this._selectPsychicThrowFireTB.bind(this));
    html.on('click', '.radio-psychic-selected-throwfire-tr', this._selectPsychicThrowFireTR.bind(this));
    html.on('click', '.radio-psychic-selected-throwfire-tt', this._selectPsychicThrowFireTT.bind(this));
    html.on('click', '.radio-psychic-selected-throwfire-th', this._selectPsychicThrowFireTH.bind(this));
    html.on('click', '.radio-psychic-selected-throwfire-tn', this._selectPsychicThrowFireTN.bind(this));
    html.on('click', '.radio-psychic-selected-throwfire-td', this._selectPsychicThrowFireTD.bind(this));    
    // Psychic Shield Fires Radio Buttons
    html.on('click', '.radio-psychic-selected-shieldfire-sb', this._selectPsychicShieldFireSB.bind(this));
    html.on('click', '.radio-psychic-selected-shieldfire-sa', this._selectPsychicShieldFireSA.bind(this));
    html.on('click', '.radio-psychic-selected-shieldfire-sh', this._selectPsychicShieldFireSH.bind(this));
    html.on('click', '.radio-psychic-selected-shieldfire-sd', this._selectPsychicShieldFireSD.bind(this));
    // Psychic Throw Object Radio Buttons
    html.on('click', '.radio-psychic-selected-throwobject-tb', this._selectPsychicThrowObjectTB.bind(this));
    html.on('click', '.radio-psychic-selected-throwobject-tr', this._selectPsychicThrowObjectTR.bind(this));
    html.on('click', '.radio-psychic-selected-throwobject-tt', this._selectPsychicThrowObjectTT.bind(this));
    html.on('click', '.radio-psychic-selected-throwobject-th', this._selectPsychicThrowObjectTH.bind(this));
    html.on('click', '.radio-psychic-selected-throwobject-tn', this._selectPsychicThrowObjectTN.bind(this));
    html.on('click', '.radio-psychic-selected-throwobject-td', this._selectPsychicThrowObjectTD.bind(this));
    // Psychic Shield Kinetic Radio Buttons
    html.on('click', '.radio-psychic-selected-shieldkinetic-sb', this._selectPsychicShieldKineticSB.bind(this));
    html.on('click', '.radio-psychic-selected-shieldkinetic-sa', this._selectPsychicShieldKineticSA.bind(this));
    html.on('click', '.radio-psychic-selected-shieldkinetic-sh', this._selectPsychicShieldKineticSH.bind(this));
    html.on('click', '.radio-psychic-selected-shieldkinetic-sd', this._selectPsychicShieldKineticSD.bind(this));
    // Psychic Flight Radio Buttons
    html.on('click', '.radio-psychic-selected-flight-fb', this._selectPsychicFlightFB.bind(this));
    html.on('click', '.radio-psychic-selected-flight-ft', this._selectPsychicFlightFT.bind(this));
    html.on('click', '.radio-psychic-selected-flight-fs', this._selectPsychicFlightFS.bind(this));
    html.on('click', '.radio-psychic-selected-flight-fd', this._selectPsychicFlightFD.bind(this));
    // Psychic Understand Language Radio Buttons
    html.on('click', '.radio-psychic-selected-understandlanguages-ub', this._selectPsychicUnderstandLanguagesUB.bind(this));
    html.on('click', '.radio-psychic-selected-understandlanguages-uu', this._selectPsychicUnderstandLanguagesUU.bind(this));
    html.on('click', '.radio-psychic-selected-understandlanguages-ud', this._selectPsychicUnderstandLanguagesUD.bind(this));
    // Psychic Reading Radio Buttons
    html.on('click', '.radio-psychic-selected-reading-rb', this._selectPsychicReadingRB.bind(this));
    html.on('click', '.radio-psychic-selected-reading-rd', this._selectPsychicReadingRD.bind(this));
    html.on('click', '.radio-psychic-selected-reading-rr', this._selectPsychicReadingRR.bind(this));
    html.on('click', '.radio-psychic-selected-reading-rt', this._selectPsychicReadingRT.bind(this));
    // Psychic Talking Radio Buttons
    html.on('click', '.radio-psychic-selected-talking-tb', this._selectPsychicTalkingTB.bind(this));
    html.on('click', '.radio-psychic-selected-talking-td', this._selectPsychicTalkingTD.bind(this));
    html.on('click', '.radio-psychic-selected-talking-tt', this._selectPsychicTalkingTT.bind(this));
    /* --------------------------------------------
     Totem Aspect
      -------------------------------------------- */
    //Training Status Change
    html.on('change', '.training-select-aspect', this._onTrainingSelectTotem.bind(this));
    // Select Animal
    html.on('change', '.totem-animal-select', this._selectTotemAnimal.bind(this));
    // Switch Tick Mark
    html.on('click', '.switch-tick-aspect', this._switchTickMarkTotem.bind(this));
    // Select Totem Aspect
    html.on('click', '.radio-selected-aspect', this._selectTotemAspect.bind(this));
    // Hide Psychic Calculations
    html.on('click', '.hide-show-aspect', this._rotateExpandTRAspect.bind(this));
    // Banishing
    html.on('click', '.radio-selected-banshing-bb', this._selectBanishingBB.bind(this));
    html.on('click', '.radio-selected-banshing-bs', this._selectBanishingBS.bind(this));
    html.on('click', '.radio-selected-banshing-br', this._selectBanishingBR.bind(this));
    // Bolstering
    html.on('click', '.radio-selected-bolstering-bb', this._selectBolsteringBB.bind(this));
    html.on('click', '.radio-selected-bolstering-bs', this._selectBolsteringBS.bind(this));
    html.on('click', '.radio-selected-bolstering-bd', this._selectBolsteringBD.bind(this));
    // Controlling
    html.on('click', '.radio-selected-controlling-cb', this._selectControllingCB.bind(this));
    html.on('click', '.radio-selected-controlling-cs', this._selectControllingCS.bind(this));
    html.on('click', '.radio-selected-controlling-cr', this._selectControllingCR.bind(this));
    html.on('click', '.radio-selected-controlling-cd', this._selectControllingCD.bind(this));
    // Creation
    html.on('click', '.radio-selected-creation-cb', this._selectCreationCB.bind(this));
    html.on('click', '.radio-selected-creation-cs', this._selectCreationCS.bind(this));
    html.on('click', '.radio-selected-creation-cl', this._selectCreationCL.bind(this));
    html.on('click', '.radio-selected-creation-cd', this._selectCreationCD.bind(this));
    // Destructive
    html.on('click', '.radio-selected-destructive-db', this._selectDestructiveDB.bind(this));
    html.on('click', '.radio-selected-destructive-dn', this._selectDestructiveDN.bind(this));
    html.on('click', '.radio-selected-destructive-dd', this._selectDestructiveDD.bind(this));
    html.on('click', '.radio-selected-destructive-dr', this._selectDestructiveDR.bind(this));
    html.on('click', '.radio-selected-destructive-dh', this._selectDestructiveDH.bind(this));
    // Healing
    html.on('click', '.radio-selected-healing-hb', this._selectHealingHB.bind(this));
    html.on('click', '.radio-selected-healing-hh', this._selectHealingHH.bind(this));
    // Protective
    html.on('click', '.radio-selected-protective-pb', this._selectProtectivePB.bind(this));
    html.on('click', '.radio-selected-protective-pa', this._selectProtectivePA.bind(this));
    html.on('click', '.radio-selected-protective-ph', this._selectProtectivePH.bind(this));
    html.on('click', '.radio-selected-protective-pd', this._selectProtectivePD.bind(this));
    // Reduction
    html.on('click', '.radio-selected-reduction-rb', this._selectReductionRB.bind(this));
    html.on('click', '.radio-selected-reduction-rs', this._selectReductionRS.bind(this));
    html.on('click', '.radio-selected-reduction-rd', this._selectReductionRD.bind(this));
    html.on('click', '.radio-selected-reduction-rr', this._selectReductionRR.bind(this));
    // Summoning
    html.on('click', '.radio-selected-summoning-sb', this._selectSummoningSB.bind(this));
    html.on('click', '.radio-selected-summoning-ss', this._selectSummoningSS.bind(this));
    html.on('click', '.radio-selected-summoning-sd', this._selectSummoningSD.bind(this));
    // Transformation
    html.on('click', '.radio-selected-transformation-tb', this._selectTransformationTB.bind(this));
    html.on('click', '.radio-selected-transformation-ts', this._selectTransformationTS.bind(this));
    html.on('click', '.radio-selected-transformation-tr', this._selectTransformationTR.bind(this));
    html.on('click', '.radio-selected-transformation-td', this._selectTransformationTD.bind(this));
    
    
    
  
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

    if(dataset.rolltype === 'skill' || dataset.rolltype === 'magic-word' || dataset.rolltype === 'psychic-power' || dataset.rolltype === 'totem-aspect') {
      const die = dataset.die;
      const bonus = Number(dataset.bonus);
      const grit = dataset.grit;
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
        uproll = `${updie}${upbonus}+${grit}`;
      } else {
        uproll = `${updie}+${upbonus}+${grit}`;
      }
      if(bonus < 0) {
        stdroll = `${die}${bonus}+${grit}`;
      } else {
        stdroll = `${die}+${bonus}+${grit}`;
      }
      if(downbonus < 0) {
        downroll = `${downdie}${downbonus}+${grit}`;
      } else {
        downroll = `${downdie}+${downbonus}+${grit}`;
      }

      const label = `[${dataset.rolltype}] ${dataset.label}`;
      let modifier = 0;
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
    const total = Number(data.cost) + this.actor.system.wordCosts.wordRepair.costSize;
    await this.actor.update({
      [`system.wordCosts.wordRepair.costRepair`]: data.cost,
      [`system.wordCosts.wordRepair.costTotal`]: total
    })
  }
  async _selectRepairRS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.wordCosts.wordRepair.costRepair;
    await this.actor.update({
      [`system.wordCosts.wordRepair.costSize`]: data.cost,
      [`system.wordCosts.wordRepair.costTotal`]: total
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

  /* --------------------------------------------
    * PSYCHIC
    * -------------------------------------------- */
  /* --------------------------------------------
    * Training Status Change - Psychic
    * -------------------------------------------- */
  async _onTrainingSelectPsychic(event) {
    event.preventDefault();
    console.log("Training Select Psychic", event);
    const element = event.currentTarget;
    const power = element.name;
    console.log("Power", power)

    const newTrainingStatus = event.currentTarget.value;

    const actorData = this.actor.system;
    const currentPower = actorData.psychic[power];
    console.log("Current Power", currentPower);

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

    const totalBase = bonusBase + currentPower.hindranceMod + currentPower.traitMod + currentPower.cyberMod + currentPower.bioMod;
    await this.actor.update({
      [`system.psychic.${power}.trainingStatus`]: newTrainingStatus,
      [`system.psychic.${power}.die`]: dieBase,
      [`system.psychic.${power}.bonusMod`]: bonusBase,
      [`system.psychic.${power}.totalBonus`]: totalBase,
      [`system.psychic.${power}.isNegBase`]: (totalBase < 0),
      [`system.psychic.${power}.usageTickSucc0`]: false,
      [`system.psychic.${power}.usageTickSucc1`]: false,
      [`system.psychic.${power}.usageTickSucc2`]: false,
      [`system.psychic.${power}.usageTickSucc3`]: false,
      [`system.psychic.${power}.usageTickSucc4`]: false,
      [`system.psychic.${power}.usageTickSucc5`]: false,
      [`system.psychic.${power}.usageTickSucc6`]: false,
      [`system.psychic.${power}.usageTickSucc7`]: false,
      [`system.psychic.${power}.usageTickSucc8`]: false,
      [`system.psychic.${power}.usageTickSucc9`]: false,
    });
  }

  /* --------------------------------------------
    * Switch Tick Mark - Psychic
    * -------------------------------------------- */
  async _switchTickMarkPsychic(event) {
    event.preventDefault();
    console.log("EVENT", event);
    console.log("ACTOR", this.actor);
    const power = event.currentTarget.dataset.label.toLowerCase();
    
    const hs = this.actor.system.psychic[power].hideShow === 'none' ? 'table-row' : 'none';
    const r = this.actor.system.psychic[power].rotate === 'fa-caret-down' ? 'fa-caret-right' : 'fa-caret-down';
    console.log("ROTATE", r);
    console.log("HIDE", hs);
    const result = await this.actor.update({
      [`system.psychic.${power}.rotate`]: r,
      [`system.psychic.${power}.hideShow`]: hs
    })
  }

  /* --------------------------------------------
    * Hide Word Calculations - Psychic
    * -------------------------------------------- */
  async _rotateExpandTRPsychic(event) {
    event.preventDefault();
    console.log("EVENT", event.currentTarget.dataset);
    console.log("ACTOR", this.actor);
    const power = event.currentTarget.dataset.label.toLowerCase();
    console.log("1789 POWER", power);
    const hs = this.actor.system.psychic[power].hideShow === 'none' ? 'table-row' : 'none';
    const r = this.actor.system.psychic[power].rotate === 'fa-caret-down' ? 'fa-caret-right' : 'fa-caret-down';
    console.log("ROTATE", r);
    console.log("HIDE", hs);
    const result = await this.actor.update({
      [`system.psychic.${power}.rotate`]: r,
      [`system.psychic.${power}.hideShow`]: hs
    })
  }
  /* --------------------------------------------
    * Select Psychic Power
    * -------------------------------------------- */
  async _selectPsychicPower(event) {
    event.preventDefault();
    console.log("SELECT PSYCHIC POWER", event);
    const power = event.currentTarget.dataset.power;
    console.log("POWER", power);
    const result = await this.actor.update({
      [`system.currentPsychicSelection.power`]: power,
    })
  }
  /* --------------------------------------------
    * Psychic Confusion
    * -------------------------------------------- */
  async _selectPsychicConfusionCB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.confusion.costResistance + this.actor.system.psychicCosts.confusion.costTarget + this.actor.system.psychicCosts.confusion.costDuration;
    await this.actor.update({
      [`system.psychicCosts.confusion.costBase`]: data.cost,
      [`system.psychicCosts.confusion.costTotal`]: total
    })
  }
  async _selectPsychicConfusionCR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.confusion.costBase + this.actor.system.psychicCosts.confusion.costTarget + this.actor.system.psychicCosts.confusion.costDuration;
    await this.actor.update({
      [`system.psychicCosts.confusion.costResistance`]: data.cost,
      [`system.psychicCosts.confusion.costTotal`]: total
    })
  }
  async _selectPsychicConfusionCT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.confusion.costBase + this.actor.system.psychicCosts.confusion.costResistance + this.actor.system.psychicCosts.confusion.costDuration;
    await this.actor.update({
      [`system.psychicCosts.confusion.costTarget`]: data.cost,
      [`system.psychicCosts.confusion.costTotal`]: total
    })
  }
  async _selectPsychicConfusionCD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.confusion.costBase + this.actor.system.psychicCosts.confusion.costResistance + this.actor.system.psychicCosts.confusion.costTarget;
    await this.actor.update({
      [`system.psychicCosts.confusion.costDuration`]: data.cost,
      [`system.psychicCosts.confusion.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Charm
    * -------------------------------------------- */
  async _selectPsychicCharmCB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.charm.costResistance + this.actor.system.psychicCosts.charm.costTarget + this.actor.system.psychicCosts.charm.costDuration;
    await this.actor.update({
      [`system.psychicCosts.charm.costBase`]: data.cost,
      [`system.psychicCosts.charm.costTotal`]: total
    })
  }
  async _selectPsychicCharmCR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.charm.costBase + this.actor.system.psychicCosts.charm.costTarget + this.actor.system.psychicCosts.charm.costDuration;
    await this.actor.update({
      [`system.psychicCosts.charm.costResistance`]: data.cost,
      [`system.psychicCosts.charm.costTotal`]: total
    })
  }
  async _selectPsychicCharmCT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.charm.costBase + this.actor.system.psychicCosts.charm.costResistance + this.actor.system.psychicCosts.charm.costDuration;
    await this.actor.update({
      [`system.psychicCosts.charm.costTarget`]: data.cost,
      [`system.psychicCosts.charm.costTotal`]: total
    })
  }
  async _selectPsychicCharmCD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.charm.costBase + this.actor.system.psychicCosts.charm.costResistance + this.actor.system.psychicCosts.charm.costTarget;
    await this.actor.update({
      [`system.psychicCosts.charm.costDuration`]: data.cost,
      [`system.psychicCosts.charm.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Dominate
    * -------------------------------------------- */
  async _selectPsychicDominateDB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.dominate.costResistance + this.actor.system.psychicCosts.dominate.costTarget + this.actor.system.psychicCosts.dominate.costDuration;
    await this.actor.update({
      [`system.psychicCosts.dominate.costBase`]: data.cost,
      [`system.psychicCosts.dominate.costTotal`]: total
    })
  }
  async _selectPsychicDominateDR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.dominate.costBase + this.actor.system.psychicCosts.dominate.costTarget + this.actor.system.psychicCosts.dominate.costDuration;
    await this.actor.update({
      [`system.psychicCosts.dominate.costResistance`]: data.cost,
      [`system.psychicCosts.dominate.costTotal`]: total
    })
  }
  async _selectPsychicDominateDT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.dominate.costBase + this.actor.system.psychicCosts.dominate.costResistance + this.actor.system.psychicCosts.dominate.costDuration;
    await this.actor.update({
      [`system.psychicCosts.dominate.costTarget`]: data.cost,
      [`system.psychicCosts.dominate.costTotal`]: total
    })
  }
  async _selectPsychicDominateDD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.dominate.costBase + this.actor.system.psychicCosts.dominate.costResistance + this.actor.system.psychicCosts.dominate.costTarget;
    await this.actor.update({
      [`system.psychicCosts.dominate.costDuration`]: data.cost,
      [`system.psychicCosts.dominate.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Locate Power
    * -------------------------------------------- */
  async _selectPsychicLocatePowerLB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locatepower.costTarget + this.actor.system.psychicCosts.locatepower.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locatepower.costBase`]: data.cost,
      [`system.psychicCosts.locatepower.costTotal`]: total
    })
  }
  async _selectPsychicLocatePowerLD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locatepower.costBase + this.actor.system.psychicCosts.locatepower.costTarget;
    await this.actor.update({
      [`system.psychicCosts.locatepower.costDuration`]: data.cost,
      [`system.psychicCosts.locatepower.costTotal`]: total
    })
  }
  async _selectPsychicLocatePowerLT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locatepower.costBase + this.actor.system.psychicCosts.locatepower.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locatepower.costTarget`]: data.cost,
      [`system.psychicCosts.locatepower.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Locate Thing
    * -------------------------------------------- */
  async _selectPsychicLocateThingLB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locatething.costTarget + this.actor.system.psychicCosts.locatething.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locatething.costBase`]: data.cost,
      [`system.psychicCosts.locatething.costTotal`]: total
    })
  }
  async _selectPsychicLocateThingLD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locatething.costBase + this.actor.system.psychicCosts.locatething.costTarget;
    await this.actor.update({
      [`system.psychicCosts.locatething.costDuration`]: data.cost,
      [`system.psychicCosts.locatething.costTotal`]: total
    })
  }
  async _selectPsychicLocateThingLT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locatething.costBase + this.actor.system.psychicCosts.locatething.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locatething.costTarget`]: data.cost,
      [`system.psychicCosts.locatething.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Locate Person
    * -------------------------------------------- */
  async _selectPsychicLocatePersonLB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locateperson.costResistance + this.actor.system.psychicCosts.locateperson.costTarget + this.actor.system.psychicCosts.locateperson.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locateperson.costBase`]: data.cost,
      [`system.psychicCosts.locateperson.costTotal`]: total
    })
  }
  async _selectPsychicLocatePersonLR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locateperson.costBase + this.actor.system.psychicCosts.locateperson.costTarget + this.actor.system.psychicCosts.locateperson.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locateperson.costResistance`]: data.cost,
      [`system.psychicCosts.locateperson.costTotal`]: total
    })
  }
  async _selectPsychicLocatePersonLD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locateperson.costBase + this.actor.system.psychicCosts.locateperson.costResistance + this.actor.system.psychicCosts.locateperson.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locateperson.costDuration`]: data.cost,
      [`system.psychicCosts.locateperson.costTotal`]: total
    })
  }
  async _selectPsychicLocatePersonLT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.locateperson.costBase + this.actor.system.psychicCosts.locateperson.costResistance + this.actor.system.psychicCosts.locateperson.costDuration;
    await this.actor.update({
      [`system.psychicCosts.locateperson.costTarget`]: data.cost,
      [`system.psychicCosts.locateperson.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Drain Recharge
    * -------------------------------------------- */
  async _selectPsychicDrainRechargeDB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.drainrecharge.costResistance + this.actor.system.psychicCosts.drainrecharge.costTarget;
    await this.actor.update({
      [`system.psychicCosts.drainrecharge.costBase`]: data.cost,
      [`system.psychicCosts.drainrecharge.costTotal`]: total
    })
  }
  async _selectPsychicDrainRechargeDR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.drainrecharge.costBase + this.actor.system.psychicCosts.drainrecharge.costTarget;
    await this.actor.update({
      [`system.psychicCosts.drainrecharge.costResistance`]: data.cost,
      [`system.psychicCosts.drainrecharge.costTotal`]: total
    })
  }
  async _selectPsychicDrainRechargeDT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.drainrecharge.costBase + this.actor.system.psychicCosts.drainrecharge.costResistance;
    await this.actor.update({
      [`system.psychicCosts.drainrecharge.costTarget`]: data.cost,
      [`system.psychicCosts.drainrecharge.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Throw Electrical
    * -------------------------------------------- */
  async _selectPsychicThrowElectricalTB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.throwelectrical
    const total = Number(data.cost) + te.costResistance + te.costTarget + te.costDamageDice + te.costDamageNumber + te.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwelectrical.costBase`]: data.cost,
      [`system.psychicCosts.throwelectrical.costTotal`]: total
    })
  }
  async _selectPsychicThrowElectricalTR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.throwelectrical
    const total = Number(data.cost) + te.costBase + te.costTarget + te.costDamageDice + te.costDamageNumber + te.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwelectrical.costResistance`]: data.cost,
      [`system.psychicCosts.throwelectrical.costTotal`]: total
    })
  }
  async _selectPsychicThrowElectricalTT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.throwelectrical
    const total = Number(data.cost) + te.costBase + te.costResistance + te.costDamageDice + te.costDamageNumber + te.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwelectrical.costTarget`]: data.cost,
      [`system.psychicCosts.throwelectrical.costTotal`]: total
    })
  }
  async _selectPsychicThrowElectricalTN(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.throwelectrical
    const total = Number(data.cost) + te.costBase + te.costResistance + te.costTarget + te.costDamageDice + te.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwelectrical.costDamageNumber`]: data.cost,
      [`system.psychicCosts.throwelectrical.costTotal`]: total
    })
  }
  async _selectPsychicThrowElectricalTD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.throwelectrical
    const total = Number(data.cost) + te.costBase + te.costResistance + te.costTarget + te.costDamageNumber + te.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwelectrical.costDamageDice`]: data.cost,
      [`system.psychicCosts.throwelectrical.costTotal`]: total
    })
  }
  async _selectPsychicThrowElectricalTH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.throwelectrical
    const total = Number(data.cost) + te.costBase + te.costResistance + te.costTarget + te.costDamageNumber + te.costDamageDice;
    await this.actor.update({
      [`system.psychicCosts.throwelectrical.costHeavy`]: data.cost,
      [`system.psychicCosts.throwelectrical.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Shield Electrical
    * -------------------------------------------- */
  async _selectPsychicShieldElectricalSB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldelectrical
    const total = Number(data.cost) + se.costArmorRating + se.costHeavy + se.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldelectrical.costBase`]: data.cost,
      [`system.psychicCosts.shieldelectrical.costTotal`]: total
    })
  }
  async _selectPsychicShieldElectricalSA(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldelectrical
    const total = Number(data.cost) + se.costBase + se.costHeavy + se.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldelectrical.costArmorRating`]: data.cost,
      [`system.psychicCosts.shieldelectrical.costTotal`]: total
    })
  }
  async _selectPsychicShieldElectricalSH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldelectrical
    const total = Number(data.cost) + se.costBase + se.costArmorRating + se.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldelectrical.costHeavy`]: data.cost,
      [`system.psychicCosts.shieldelectrical.costTotal`]: total
    })
  }
  async _selectPsychicShieldElectricalSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldelectrical
    const total = Number(data.cost) + se.costBase + se.costArmorRating + se.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.shieldelectrical.costDuration`]: data.cost,
      [`system.psychicCosts.shieldelectrical.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Calm Emotions
    * -------------------------------------------- */
  async _selectPsychicCalmEmotionsCB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.calmemotions.costResistance + this.actor.system.psychicCosts.calmemotions.costTarget;
    await this.actor.update({
      [`system.psychicCosts.calmemotions.costBase`]: data.cost,
      [`system.psychicCosts.calmemotions.costTotal`]: total
    })
  }
  async _selectPsychicCalmEmotionsCR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.calmemotions.costBase + this.actor.system.psychicCosts.calmemotions.costTarget;
    await this.actor.update({
      [`system.psychicCosts.calmemotions.costResistance`]: data.cost,
      [`system.psychicCosts.calmemotions.costTotal`]: total
    })
  }
  async _selectPsychicCalmEmotionsCT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.calmemotions.costBase + this.actor.system.psychicCosts.calmemotions.costResistance;
    await this.actor.update({
      [`system.psychicCosts.calmemotions.costTarget`]: data.cost,
      [`system.psychicCosts.calmemotions.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Bolster Emotions
    * -------------------------------------------- */
  async _selectPsychicBolsterEmotionsBB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.bolsteremotions.costCondition + this.actor.system.psychicCosts.bolsteremotions.costTarget;
    await this.actor.update({
      [`system.psychicCosts.bolsteremotions.costBase`]: data.cost,
      [`system.psychicCosts.bolsteremotions.costTotal`]: total
    })
  }
  async _selectPsychicBolsterEmotionsBC(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.bolsteremotions.costBase + this.actor.system.psychicCosts.bolsteremotions.costTarget;
    await this.actor.update({
      [`system.psychicCosts.bolsteremotions.costCondition`]: data.cost,
      [`system.psychicCosts.bolsteremotions.costTotal`]: total
    })
  }
  async _selectPsychicBolsterEmotionsBT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.bolsteremotions.costBase + this.actor.system.psychicCosts.bolsteremotions.costCondition;
    await this.actor.update({
      [`system.psychicCosts.bolsteremotions.costTarget`]: data.cost,
      [`system.psychicCosts.bolsteremotions.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Healing
    * -------------------------------------------- */
  async _selectPsychicHealingHB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.healing.costTarget + this.actor.system.psychicCosts.healing.costHeal;
    await this.actor.update({
      [`system.psychicCosts.healing.costBase`]: data.cost,
      [`system.psychicCosts.healing.costTotal`]: total
    })
  }
  async _selectPsychicHealingHH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.healing.costBase + this.actor.system.psychicCosts.healing.costTarget;
    await this.actor.update({
      [`system.psychicCosts.healing.costHeal`]: data.cost,
      [`system.psychicCosts.healing.costTotal`]: total
    })
  }
  async _selectPsychicHealingHT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.healing.costBase + this.actor.system.psychicCosts.healing.costHeal;
    await this.actor.update({
      [`system.psychicCosts.healing.costTarget`]: data.cost,
      [`system.psychicCosts.healing.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Create Evaporate Water
    * -------------------------------------------- */
  async _selectPsychicCreateEvaporateWaterCB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.createevaporatewater.costResistance + this.actor.system.psychicCosts.createevaporatewater.costTarget;
    await this.actor.update({
      [`system.psychicCosts.createevaporatewater.costBase`]: data.cost,
      [`system.psychicCosts.createevaporatewater.costTotal`]: total
    })
  }
  async _selectPsychicCreateEvaporateWaterCR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.createevaporatewater.costBase + this.actor.system.psychicCosts.createevaporatewater.costTarget;
    await this.actor.update({
      [`system.psychicCosts.createevaporatewater.costResistance`]: data.cost,
      [`system.psychicCosts.createevaporatewater.costTotal`]: total
    })
  }
  async _selectPsychicCreateEvaporateWaterCT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const total = Number(data.cost) + this.actor.system.psychicCosts.createevaporatewater.costBase + this.actor.system.psychicCosts.createevaporatewater.costResistance;
    await this.actor.update({
      [`system.psychicCosts.createevaporatewater.costTarget`]: data.cost,
      [`system.psychicCosts.createevaporatewater.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Throw Water
    * -------------------------------------------- */
  async _selectPsychicThrowWaterTB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tw = this.actor.system.psychicCosts.throwwater;
    const total = Number(data.cost) + tw.costResistance + tw.costTarget + tw.costDamageDice + tw.costDamageNumber + tw.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwwater.costBase`]: data.cost,
      [`system.psychicCosts.throwwater.costTotal`]: total
    })
  }
  async _selectPsychicThrowWaterTR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tw = this.actor.system.psychicCosts.throwwater;
    const total = Number(data.cost) + tw.costBase + tw.costTarget + tw.costDamageDice + tw.costDamageNumber + tw.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwwater.costResistance`]: data.cost,
      [`system.psychicCosts.throwwater.costTotal`]: total
    })
  }
  async _selectPsychicThrowWaterTT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tw = this.actor.system.psychicCosts.throwwater;
    const total = Number(data.cost) + tw.costBase + tw.costResistance + tw.costDamageDice + tw.costDamageNumber + tw.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwwater.costTarget`]: data.cost,
      [`system.psychicCosts.throwwater.costTotal`]: total
    })
  }
  async _selectPsychicThrowWaterTH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tw = this.actor.system.psychicCosts.throwwater;
    const total = Number(data.cost) + tw.costBase + tw.costResistance + tw.costTarget + tw.costDamageNumber + tw.costDamageDice;
    await this.actor.update({
      [`system.psychicCosts.throwwater.costHeavy`]: data.cost,
      [`system.psychicCosts.throwwater.costTotal`]: total
    })
  }
  async _selectPsychicThrowWaterTN(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tw = this.actor.system.psychicCosts.throwwater;
    const total = Number(data.cost) + tw.costBase + tw.costResistance + tw.costTarget + tw.costHeavy + tw.costDamageDice;
    await this.actor.update({
      [`system.psychicCosts.throwwater.costDamageNumber`]: data.cost,
      [`system.psychicCosts.throwwater.costTotal`]: total
    })
  }
  async _selectPsychicThrowWaterTD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tw = this.actor.system.psychicCosts.throwwater;
    const total = Number(data.cost) + tw.costBase + tw.costResistance + tw.costTarget + tw.costHeavy + tw.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.throwwater.costDamageDice`]: data.cost,
      [`system.psychicCosts.throwwater.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Engulf
    * -------------------------------------------- */
  async _selectPsychicEngulfEB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.engulf;
    const total = Number(data.cost) + te.costResistance + te.costTarget + te.costDuration;
    await this.actor.update({
      [`system.psychicCosts.engulf.costBase`]: data.cost,
      [`system.psychicCosts.engulf.costTotal`]: total
    })
  }
  async _selectPsychicEngulfER(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.engulf;
    const total = Number(data.cost) + te.costBase + te.costTarget + te.costDuration;
    await this.actor.update({
      [`system.psychicCosts.engulf.costResistance`]: data.cost,
      [`system.psychicCosts.engulf.costTotal`]: total
    })
  }
  async _selectPsychicEngulfET(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.engulf;
    const total = Number(data.cost) + te.costBase + te.costResistance + te.costDuration;
    await this.actor.update({
      [`system.psychicCosts.engulf.costTarget`]: data.cost,
      [`system.psychicCosts.engulf.costTotal`]: total
    })
  }
  async _selectPsychicEngulfED(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const te = this.actor.system.psychicCosts.engulf;
    const total = Number(data.cost) + te.costBase + te.costResistance + te.costTarget;
    await this.actor.update({
      [`system.psychicCosts.engulf.costDuration`]: data.cost,
      [`system.psychicCosts.engulf.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Illusion
    * -------------------------------------------- */
  async _selectPsychicIllusionIB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const i = this.actor.system.psychicCosts.illusion;
    const total = Number(data.cost) + i.costResistance + i.costTarget + i.costDuration;
    await this.actor.update({
      [`system.psychicCosts.illusion.costBase`]: data.cost,
      [`system.psychicCosts.illusion.costTotal`]: total
    })
  }
  async _selectPsychicIllusionIR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const i = this.actor.system.psychicCosts.illusion;
    const total = Number(data.cost) + i.costBase + i.costTarget + i.costDuration;
    await this.actor.update({
      [`system.psychicCosts.illusion.costResistance`]: data.cost,
      [`system.psychicCosts.illusion.costTotal`]: total
    })
  }
  async _selectPsychicIllusionID(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const i = this.actor.system.psychicCosts.illusion;
    const total = Number(data.cost) + i.costBase + i.costResistance + i.costDuration;
    await this.actor.update({
      [`system.psychicCosts.illusion.costTarget`]: data.cost,
      [`system.psychicCosts.illusion.costTotal`]: total
    })
  }
  async _selectPsychicIllusionIT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const i = this.actor.system.psychicCosts.illusion;
    const total = Number(data.cost) + i.costBase + i.costResistance + i.costTarget;
    await this.actor.update({
      [`system.psychicCosts.illusion.costDuration`]: data.cost,
      [`system.psychicCosts.illusion.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Wipe
    * -------------------------------------------- */
  async _selectPsychicWipeWB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const w = this.actor.system.psychicCosts.wipe;
    const total = Number(data.cost) + w.costResistance + w.costTarget + w.costDuration + w.costBack;
    await this.actor.update({
      [`system.psychicCosts.wipe.costBase`]: data.cost,
      [`system.psychicCosts.wipe.costTotal`]: total
    })
  }
  async _selectPsychicWipeWR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const w = this.actor.system.psychicCosts.wipe;
    const total = Number(data.cost) + w.costBase + w.costTarget + w.costDuration + w.costBack;
    await this.actor.update({
      [`system.psychicCosts.wipe.costResistance`]: data.cost,
      [`system.psychicCosts.wipe.costTotal`]: total
    })
  }
  async _selectPsychicWipeWH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const w = this.actor.system.psychicCosts.wipe;
    const total = Number(data.cost) + w.costBase + w.costResistance + w.costDuration + w.costTarget;
    await this.actor.update({
      [`system.psychicCosts.wipe.costBack`]: data.cost,
      [`system.psychicCosts.wipe.costTotal`]: total
    })
  }
  async _selectPsychicWipeWD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const w = this.actor.system.psychicCosts.wipe;
    const total = Number(data.cost) + w.costBase + w.costResistance + w.costTarget + w.costBack;
    await this.actor.update({
      [`system.psychicCosts.wipe.costDuration`]: data.cost,
      [`system.psychicCosts.wipe.costTotal`]: total
    })
  }
  async _selectPsychicWipeWT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const w = this.actor.system.psychicCosts.wipe;
    const total = Number(data.cost) + w.costBase + w.costResistance + w.costDuration + w.costBack;
    await this.actor.update({
      [`system.psychicCosts.wipe.costTarget`]: data.cost,
      [`system.psychicCosts.wipe.costTotal`]: total
    })
  }
  async _selectPsychicModifyMB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const m = this.actor.system.psychicCosts.modify;
    const total = Number(data.cost) + m.costResistance + m.costTarget + m.costDuration + m.costBack;
    await this.actor.update({
      [`system.psychicCosts.modify.costBase`]: data.cost,
      [`system.psychicCosts.modify.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Modify
    * -------------------------------------------- */
  async _selectPsychicModifyMR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const m = this.actor.system.psychicCosts.modify;
    const total = Number(data.cost) + m.costBase + m.costTarget + m.costDuration + m.costBack;
    await this.actor.update({
      [`system.psychicCosts.modify.costResistance`]: data.cost,
      [`system.psychicCosts.modify.costTotal`]: total
    })
  }
  async _selectPsychicModifyMH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const m = this.actor.system.psychicCosts.modify;
    const total = Number(data.cost) + m.costBase + m.costResistance + m.costDuration + m.costTarget;
    await this.actor.update({
      [`system.psychicCosts.modify.costBack`]: data.cost,
      [`system.psychicCosts.modify.costTotal`]: total
    })
  }
  async _selectPsychicModifyMD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const m = this.actor.system.psychicCosts.modify;
    const total = Number(data.cost) + m.costBase + m.costResistance + m.costTarget + m.costBack;
    await this.actor.update({
      [`system.psychicCosts.modify.costDuration`]: data.cost,
      [`system.psychicCosts.modify.costTotal`]: total
    })
  }
  async _selectPsychicModifyMT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const m = this.actor.system.psychicCosts.modify;
    const total = Number(data.cost) + m.costBase + m.costResistance + m.costDuration + m.costBack;
    await this.actor.update({
      [`system.psychicCosts.modify.costTarget`]: data.cost,
      [`system.psychicCosts.modify.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Light
    * -------------------------------------------- */
  async _selectPsychicLightLB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const l = this.actor.system.psychicCosts.light;
    const total = Number(data.cost) + l.costLight + l.costDuration;
    await this.actor.update({
      [`system.psychicCosts.light.costBase`]: data.cost,
      [`system.psychicCosts.light.costTotal`]: total
    })
  }
  async _selectPsychicLightLR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const l = this.actor.system.psychicCosts.light;
    const total = Number(data.cost) + l.costBase + l.costDuration;
    await this.actor.update({
      [`system.psychicCosts.light.costLight`]: data.cost,
      [`system.psychicCosts.light.costTotal`]: total
    })
  }
  async _selectPsychicLightLD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const l = this.actor.system.psychicCosts.light;
    const total = Number(data.cost) + l.costBase + l.costLight;
    await this.actor.update({
      [`system.psychicCosts.light.costDuration`]: data.cost,
      [`system.psychicCosts.light.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Project Blades
    * -------------------------------------------- */
  async _selectPsychicProjectBladesPB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectblade;
    const total = Number(data.cost) + p.costWeapon + p.costDamageDice + p.costDuration + p.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.projectblade.costBase`]: data.cost,
      [`system.psychicCosts.projectblade.costTotal`]: total
    })
  }
  async _selectPsychicProjectBladesPW(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectblade;
    const total = Number(data.cost) + p.costBase + p.costWeapon + p.costDuration + p.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.projectblade.costDamageDice`]: data.cost,
      [`system.psychicCosts.projectblade.costTotal`]: total
    })
  }
  async _selectPsychicProjectBladesPH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectblade;
    const total = Number(data.cost) + p.costBase + p.costWeapon + p.costDamageDice + p.costDuration;
    await this.actor.update({
      [`system.psychicCosts.projectblade.costHeavy`]: data.cost,
      [`system.psychicCosts.projectblade.costTotal`]: total
    })
  }
  async _selectPsychicProjectBladesPD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectblade;
    const total = Number(data.cost) + p.costBase + p.costWeapon + p.costDamageDice + p.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.projectblade.costDuration`]: data.cost,
      [`system.psychicCosts.projectblade.costTotal`]: total
    })
  }
  async _selectPsychicProjectBladesPC(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectblade;
    const total = Number(data.cost) + p.costBase + p.costDamageDice + p.costDuration + p.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.projectblade.costWeapon`]: data.cost,
      [`system.psychicCosts.projectblade.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Project Pain
    * -------------------------------------------- */
  async _selectPsychicProjectPainPB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectpain;
    const total = Number(data.cost) + p.costResistance + p.costTarget + p.costHeavy + p.costDamageDice + p.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.projectpain.costBase`]: data.cost,
      [`system.psychicCosts.projectpain.costTotal`]: total
    })
  }
  async _selectPsychicProjectPainPR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectpain;
    const total = Number(data.cost) + p.costBase + p.costTarget + p.costHeavy + p.costDamageDice + p.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.projectpain.costResistance`]: data.cost,
      [`system.psychicCosts.projectpain.costTotal`]: total
    })
  }
  async _selectPsychicProjectPainPT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectpain;
    const total = Number(data.cost) + p.costBase + p.costResistance + p.costHeavy + p.costDamageDice + p.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.projectpain.costTarget`]: data.cost,
      [`system.psychicCosts.projectpain.costTotal`]: total
    })
  }
  async _selectPsychicProjectPainPH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectpain;
    const total = Number(data.cost) + p.costBase + p.costResistance + p.costTarget + p.costDamageDice + p.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.projectpain.costHeavy`]: data.cost,
      [`system.psychicCosts.projectpain.costTotal`]: total
    })
  }
  async _selectPsychicProjectPainPD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectpain;
    const total = Number(data.cost) + p.costBase + p.costResistance + p.costTarget + p.costHeavy + p.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.projectpain.costDamageDice`]: data.cost,
      [`system.psychicCosts.projectpain.costTotal`]: total
    })
  }
  async _selectPsychicProjectPainPN(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const p = this.actor.system.psychicCosts.projectpain;
    const total = Number(data.cost) + p.costBase + p.costResistance + p.costTarget + p.costHeavy + p.costDamageDice;
    await this.actor.update({
      [`system.psychicCosts.projectpain.costDamageNumber`]: data.cost,
      [`system.psychicCosts.projectpain.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Control Fire
    * -------------------------------------------- */
  async _selectPsychicControlFireCB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const c = this.actor.system.psychicCosts.controlfires;
    const total = Number(data.cost) + c.costResistance + c.costTarget;
    await this.actor.update({
      [`system.psychicCosts.controlfires.costBase`]: data.cost,
      [`system.psychicCosts.controlfires.costTotal`]: total
    })
  }
  async _selectPsychicControlFireCR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const c = this.actor.system.psychicCosts.controlfires;
    const total = Number(data.cost) + c.costBase + c.costTarget;
    await this.actor.update({
      [`system.psychicCosts.controlfires.costResistance`]: data.cost,
      [`system.psychicCosts.controlfires.costTotal`]: total
    })
  }
  async _selectPsychicControlFireCT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const c = this.actor.system.psychicCosts.controlfires;
    const total = Number(data.cost) + c.costBase + c.costResistance;
    await this.actor.update({
      [`system.psychicCosts.controlfires.costTarget`]: data.cost,
      [`system.psychicCosts.controlfires.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Throw Fire
    * -------------------------------------------- */
  async _selectPsychicThrowFireTB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tf = this.actor.system.psychicCosts.throwfire;
    const total = Number(data.cost) + tf.costResistance + tf.costTarget + tf.costDamageDice + tf.costDamageNumber + tf.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwfire.costBase`]: data.cost,
      [`system.psychicCosts.throwfire.costTotal`]: total
    })
  }
  async _selectPsychicThrowFireTR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tf = this.actor.system.psychicCosts.throwfire;
    const total = Number(data.cost) + tf.costBase + tf.costTarget + tf.costDamageDice + tf.costDamageNumber + tf.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwfire.costResistance`]: data.cost,
      [`system.psychicCosts.throwfire.costTotal`]: total
    })
  }
  async _selectPsychicThrowFireTT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tf = this.actor.system.psychicCosts.throwfire;
    const total = Number(data.cost) + tf.costBase + tf.costResistance + tf.costDamageDice + tf.costDamageNumber + tf.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.throwfire.costTarget`]: data.cost,
      [`system.psychicCosts.throwfire.costTotal`]: total
    })
  }
  async _selectPsychicThrowFireTH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tf = this.actor.system.psychicCosts.throwfire;
    const total = Number(data.cost) + tf.costBase + tf.costResistance + tf.costTarget + tf.costDamageNumber + tf.costDamageDice;
    await this.actor.update({
      [`system.psychicCosts.throwfire.costHeavy`]: data.cost,
      [`system.psychicCosts.throwfire.costTotal`]: total
    })
  }
  async _selectPsychicThrowFireTN(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tf = this.actor.system.psychicCosts.throwfire;
    const total = Number(data.cost) + tf.costBase + tf.costResistance + tf.costTarget + tf.costHeavy + tf.costDamageDice;
    await this.actor.update({
      [`system.psychicCosts.throwfire.costDamageNumber`]: data.cost,
      [`system.psychicCosts.throwfire.costTotal`]: total
    })
  }
  async _selectPsychicThrowFireTD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const tf = this.actor.system.psychicCosts.throwfire;
    const total = Number(data.cost) + tf.costBase + tf.costResistance + tf.costTarget + tf.costHeavy + tf.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.throwfire.costDamageDice`]: data.cost,
      [`system.psychicCosts.throwfire.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Shield Fire
    * -------------------------------------------- */
  async _selectPsychicShieldFireSB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldfire;
    const total = Number(data.cost) + se.costArmorRating + se.costHeavy + se.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldfire.costBase`]: data.cost,
      [`system.psychicCosts.shieldfire.costTotal`]: total
    })
  }
  async _selectPsychicShieldFireSA(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldfire;
    const total = Number(data.cost) + se.costBase + se.costHeavy + se.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldfire.costArmorRating`]: data.cost,
      [`system.psychicCosts.shieldfire.costTotal`]: total
    })
  }
  async _selectPsychicShieldFireSH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldfire;
    const total = Number(data.cost) + se.costBase + se.costArmorRating + se.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldfire.costHeavy`]: data.cost,
      [`system.psychicCosts.shieldfire.costTotal`]: total
    })
  }
  async _selectPsychicShieldFireSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const se = this.actor.system.psychicCosts.shieldfire;
    const total = Number(data.cost) + se.costBase + se.costArmorRating + se.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.shieldfire.costDuration`]: data.cost,
      [`system.psychicCosts.shieldfire.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Throw Object
    * -------------------------------------------- */
  async _selectPsychicThrowObjectTB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const to = this.actor.system.psychicCosts.throwobject;
    const total = Number(data.cost) + to.costResistance + to.costTarget + to.costHeavy + to.costDamageDice + to.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.throwobject.costBase`]: data.cost,
      [`system.psychicCosts.throwobject.costTotal`]: total
    })
  }
  async _selectPsychicThrowObjectTR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const to = this.actor.system.psychicCosts.throwobject;
    const total = Number(data.cost) + to.costBase + to.costTarget + to.costHeavy + to.costDamageDice + to.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.throwobject.costResistance`]: data.cost,
      [`system.psychicCosts.throwobject.costTotal`]: total
    })
  }
  async _selectPsychicThrowObjectTT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const to = this.actor.system.psychicCosts.throwobject;
    const total = Number(data.cost) + to.costBase + to.costResistance + to.costHeavy + to.costDamageDice + to.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.throwobject.costTarget`]: data.cost,
      [`system.psychicCosts.throwobject.costTotal`]: total
    })
  }
  async _selectPsychicThrowObjectTH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const to = this.actor.system.psychicCosts.throwobject;
    const total = Number(data.cost) + to.costBase + to.costResistance + to.costTarget + to.costDamageDice + to.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.throwobject.costHeavy`]: data.cost,
      [`system.psychicCosts.throwobject.costTotal`]: total
    })
  }
  async _selectPsychicThrowObjectTN(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const to = this.actor.system.psychicCosts.throwobject;
    const total = Number(data.cost) + to.costBase + to.costResistance + to.costTarget + to.costHeavy + to.costDamageDice;
    await this.actor.update({
      [`system.psychicCosts.throwobject.costDamageNumber`]: data.cost,
      [`system.psychicCosts.throwobject.costTotal`]: total
    })
  }
  async _selectPsychicThrowObjectTD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const to = this.actor.system.psychicCosts.throwobject;
    const total = Number(data.cost) + to.costBase + to.costResistance + to.costTarget + to.costHeavy + to.costDamageNumber;
    await this.actor.update({
      [`system.psychicCosts.throwobject.costDamageDice`]: data.cost,
      [`system.psychicCosts.throwobject.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Shield Kinetic
    * -------------------------------------------- */
  async _selectPsychicShieldKineticSB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const sk = this.actor.system.psychicCosts.shieldkinetic;
    const total = Number(data.cost) + sk.costArmorRating + sk.costHeavy + sk.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldkinetic.costBase`]: data.cost,
      [`system.psychicCosts.shieldkinetic.costTotal`]: total
    })
  }
  async _selectPsychicShieldKineticSA(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const sk = this.actor.system.psychicCosts.shieldkinetic;
    const total = Number(data.cost) + sk.costBase + sk.costHeavy + sk.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldkinetic.costArmorRating`]: data.cost,
      [`system.psychicCosts.shieldkinetic.costTotal`]: total
    })
  }
  async _selectPsychicShieldKineticSH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const sk = this.actor.system.psychicCosts.shieldkinetic;
    const total = Number(data.cost) + sk.costBase + sk.costArmorRating + sk.costDuration;
    await this.actor.update({
      [`system.psychicCosts.shieldkinetic.costHeavy`]: data.cost,
      [`system.psychicCosts.shieldkinetic.costTotal`]: total
    })
  }
  async _selectPsychicShieldKineticSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const sk = this.actor.system.psychicCosts.shieldkinetic;
    const total = Number(data.cost) + sk.costBase + sk.costArmorRating + sk.costHeavy;
    await this.actor.update({
      [`system.psychicCosts.shieldkinetic.costDuration`]: data.cost,
      [`system.psychicCosts.shieldkinetic.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Flight
    * -------------------------------------------- */
  async _selectPsychicFlightFB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const f = this.actor.system.psychicCosts.flight;
    const total = Number(data.cost) + f.costTarget + f.costSpeed + f.costDuration;
    await this.actor.update({
      [`system.psychicCosts.flight.costBase`]: data.cost,
      [`system.psychicCosts.flight.costTotal`]: total
    })
  }
  async _selectPsychicFlightFT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const f = this.actor.system.psychicCosts.flight;
    const total = Number(data.cost) + f.costBase + f.costSpeed + f.costDuration;
    await this.actor.update({
      [`system.psychicCosts.flight.costTarget`]: data.cost,
      [`system.psychicCosts.flight.costTotal`]: total
    })
  }
  async _selectPsychicFlightFS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const f = this.actor.system.psychicCosts.flight;
    const total = Number(data.cost) + f.costBase + f.costTarget + f.costDuration;
    await this.actor.update({
      [`system.psychicCosts.flight.costSpeed`]: data.cost,
      [`system.psychicCosts.flight.costTotal`]: total
    })
  }
  async _selectPsychicFlightFD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const f = this.actor.system.psychicCosts.flight;
    const total = Number(data.cost) + f.costBase + f.costTarget + f.costSpeed;
    await this.actor.update({
      [`system.psychicCosts.flight.costDuration`]: data.cost,
      [`system.psychicCosts.flight.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Understand Languages
    * -------------------------------------------- */
  async _selectPsychicUnderstandLanguagesUB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const u = this.actor.system.psychicCosts.understandlanguages;
    const total = Number(data.cost) + u.costUnderstand + u.costDuration;
    await this.actor.update({
      [`system.psychicCosts.understandlanguages.costBase`]: data.cost,
      [`system.psychicCosts.understandlanguages.costTotal`]: total
    })
  }
  async _selectPsychicUnderstandLanguagesUU(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const u = this.actor.system.psychicCosts.understandlanguages;
    const total = Number(data.cost) + u.costBase + u.costDuration;
    await this.actor.update({
      [`system.psychicCosts.understandlanguages.costUnderstand`]: data.cost,
      [`system.psychicCosts.understandlanguages.costTotal`]: total
    })
  }
  async _selectPsychicUnderstandLanguagesUD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const u = this.actor.system.psychicCosts.understandlanguages;
    const total = Number(data.cost) + u.costBase + u.costUnderstand;
    await this.actor.update({
      [`system.psychicCosts.understandlanguages.costDuration`]: data.cost,
      [`system.psychicCosts.understandlanguages.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Reading
    * -------------------------------------------- */
  async _selectPsychicReadingRB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const r = this.actor.system.psychicCosts.reading;
    const total = Number(data.cost) + r.costDigDeep + r.costResistance + r.costTarget;
    await this.actor.update({
      [`system.psychicCosts.reading.costBase`]: data.cost,
      [`system.psychicCosts.reading.costTotal`]: total
    })
  }
  async _selectPsychicReadingRD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const r = this.actor.system.psychicCosts.reading;
    const total = Number(data.cost) + r.costBase + r.costResistance + r.costTarget;
    await this.actor.update({
      [`system.psychicCosts.reading.costDigDeep`]: data.cost,
      [`system.psychicCosts.reading.costTotal`]: total
    })
  }
  async _selectPsychicReadingRR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const r = this.actor.system.psychicCosts.reading;
    const total = Number(data.cost) + r.costBase + r.costDigDeep + r.costTarget;
    await this.actor.update({
      [`system.psychicCosts.reading.costResistance`]: data.cost,
      [`system.psychicCosts.reading.costTotal`]: total
    })
  }
  async _selectPsychicReadingRT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const r = this.actor.system.psychicCosts.reading;
    const total = Number(data.cost) + r.costBase + r.costDigDeep + r.costResistance;
    await this.actor.update({
      [`system.psychicCosts.reading.costTarget`]: data.cost,
      [`system.psychicCosts.reading.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Psychic Talking
    * -------------------------------------------- */
  async _selectPsychicTalkingTB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.psychicCosts.talking;
    const total = Number(data.cost) + t.costTarget + t.costDuration;
    await this.actor.update({
      [`system.psychicCosts.talking.costBase`]: data.cost,
      [`system.psychicCosts.talking.costTotal`]: total
    })
  }
  async _selectPsychicTalkingTD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.psychicCosts.talking;
    const total = Number(data.cost) + t.costBase + t.costTarget;
    await this.actor.update({
      [`system.psychicCosts.talking.costDuration`]: data.cost,
      [`system.psychicCosts.talking.costTotal`]: total
    })
  }
  async _selectPsychicTalkingTT(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.psychicCosts.talking;
    const total = Number(data.cost) + t.costBase + t.costDuration;
    await this.actor.update({
      [`system.psychicCosts.talking.costTarget`]: data.cost,
      [`system.psychicCosts.talking.costTotal`]: total
    })
  }
  /* --------------------------------------------
    TOTEM ASPECT
  -------------------------------------------- */
  /* --------------------------------------------
  * Switch Tick Mark - Totem
  * -------------------------------------------- */
  async _switchTickMarkTotem(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const system = this.actor.system;

    const result = await this.actor.update({
      [`system.totem.${data.aspect}.${data.tick}`]: !system.totem[data.aspect][data.tick]
    })
    console.log("RESULT", result)
  }

  /* --------------------------------------------
    * Training Status Change - Totem
    * -------------------------------------------- */
  async _onTrainingSelectTotem(event) { 
    event.preventDefault();
    console.log("Training Select Aspect", event);
    const element = event.currentTarget;
    const aspect = element.name;
    console.log("Aspect", aspect)

    const newTrainingStatus = event.currentTarget.value;

    const actorData = this.actor.system;
    const currentAspect = actorData.totem[aspect];
    console.log("Current Aspect", currentAspect);

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

    const totalBase = bonusBase + currentAspect.hindranceMod + currentAspect.traitMod + currentAspect.cyberMod + currentAspect.bioMod;
    await this.actor.update({
      [`system.totem.${aspect}.trainingStatus`]: newTrainingStatus,
      [`system.totem.${aspect}.die`]: dieBase,
      [`system.totem.${aspect}.bonusMod`]: bonusBase,
      [`system.totem.${aspect}.totalBonus`]: totalBase,
      [`system.totem.${aspect}.isNegBase`]: (totalBase < 0),
      [`system.totem.${aspect}.usageTickSucc0`]: false,
      [`system.totem.${aspect}.usageTickSucc1`]: false,
      [`system.totem.${aspect}.usageTickSucc2`]: false,
      [`system.totem.${aspect}.usageTickSucc3`]: false,
      [`system.totem.${aspect}.usageTickSucc4`]: false,
      [`system.totem.${aspect}.usageTickSucc5`]: false,
      [`system.totem.${aspect}.usageTickSucc6`]: false,
      [`system.totem.${aspect}.usageTickSucc7`]: false,
      [`system.totem.${aspect}.usageTickSucc8`]: false,
      [`system.totem.${aspect}.usageTickSucc9`]: false,
    });
  }
  /* --------------------------------------------
    * Switch Animal - Totem
    * -------------------------------------------- */
  async _selectTotemAnimal(event) {
    event.preventDefault();
    const animal = event.currentTarget.value;

    await this.actor.update({
      'system.currentTotemSelection.animal': animal
    });
  }   
  /* --------------------------------------------
    * Hide Calculations - Totem
    * -------------------------------------------- */
  async _rotateExpandTRAspect(event) {
    event.preventDefault();
    console.log("EVENT", event);
    console.log("ACTOR", this.actor);
    const aspect = event.currentTarget.dataset.label.toLowerCase();
    
    const hs = this.actor.system.totem[aspect].hideShow === 'none' ? 'table-row' : 'none';
    const r = this.actor.system.totem[aspect].rotate === 'fa-caret-down' ? 'fa-caret-right' : 'fa-caret-down';
    console.log("ROTATE", r);
    console.log("HIDE", hs);
    const result = await this.actor.update({
      [`system.totem.${aspect}.rotate`]: r,
      [`system.totem.${aspect}.hideShow`]: hs
    })
  }
  /* --------------------------------------------
    * Select Asepct - Totem
    * -------------------------------------------- */
  async _selectTotemAspect(event) {
    event.preventDefault();
    const totem = event.currentTarget.dataset.totem;
    console.log("Totem", totem);
    const result = await this.actor.update({
      'system.currentTotemSelection.totem': totem
    })
  }
  /* --------------------------------------------
    * Radio Button Banishing - Totem
    * -------------------------------------------- */
  async _selectBanishingBB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.banishing;
    const total = Number(data.cost) + t.costSize + t.costResistance;
    await this.actor.update({
      [`system.totemCosts.banishing.costBase`]: data.cost,
      [`system.totemCosts.banishing.costTotal`]: total
    })
  }
  async _selectBanishingBS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.banishing;
    const total = Number(data.cost) + t.costBase + t.costResistance;
    console.log("TOTAL", total, data.cost, t.costBase, t.costResistance);
    await this.actor.update({
      [`system.totemCosts.banishing.costSize`]: data.cost,
      [`system.totemCosts.banishing.costTotal`]: total
    })
  }
  async _selectBanishingBR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.banishing;
    const total = Number(data.cost) + t.costBase + t.costSize;
    console.log("TOTAL", total, data.cost, t.costBase, t.costSize);
    await this.actor.update({
      [`system.totemCosts.banishing.costResistance`]: data.cost,
      [`system.totemCosts.banishing.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Bolstering - Totem
    * -------------------------------------------- */
  async _selectBolsteringBB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.bolstering;
    const total = Number(data.cost) + t.costSkill + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.bolstering.costBase`]: data.cost,
      [`system.totemCosts.bolstering.costTotal`]: total
    })
  }
  async _selectBolsteringBS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.bolstering;
    const total = Number(data.cost) + t.costBase + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.bolstering.costSkill`]: data.cost,
      [`system.totemCosts.bolstering.costTotal`]: total
    })
  }
  async _selectBolsteringBD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.bolstering;
    const total = Number(data.cost) + t.costBase + t.costSkill;
    await this.actor.update({
      [`system.totemCosts.bolstering.costDuration`]: data.cost,
      [`system.totemCosts.bolstering.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Controlling - Totem
    * -------------------------------------------- */
  async _selectControllingCB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.controlling;
    const total = Number(data.cost) + t.costSize + t.costResistance + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.controlling.costBase`]: data.cost,
      [`system.totemCosts.controlling.costTotal`]: total
    })
  }
  async _selectControllingCS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.controlling;
    const total = Number(data.cost) + t.costBase + t.costResistance + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.controlling.costSize`]: data.cost,
      [`system.totemCosts.controlling.costTotal`]: total
    })
  }
  async _selectControllingCR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.controlling;
    const total = Number(data.cost) + t.costBase + t.costSize + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.controlling.costResistance`]: data.cost,
      [`system.totemCosts.controlling.costTotal`]: total
    })
  }
  async _selectControllingCD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.controlling;
    const total = Number(data.cost) + t.costBase + t.costSize + t.costResistance;
    await this.actor.update({
      [`system.totemCosts.controlling.costDuration`]: data.cost,
      [`system.totemCosts.controlling.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Creation - Totem
    * -------------------------------------------- */
  async _selectCreationCB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.creation;
    const total = Number(data.cost) + t.costSize + t.costLife + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.creation.costBase`]: data.cost,
      [`system.totemCosts.creation.costTotal`]: total
    })
  }
  async _selectCreationCS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.creation;
    const total = Number(data.cost) + t.costBase + t.costLife + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.creation.costSize`]: data.cost,
      [`system.totemCosts.creation.costTotal`]: total
    })
  }
  async _selectCreationCL(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.creation;
    const total = Number(data.cost) + t.costBase + t.costSize + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.creation.costLife`]: data.cost,
      [`system.totemCosts.creation.costTotal`]: total
    })
  }
  async _selectCreationCD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.creation;
    const total = Number(data.cost) + t.costBase + t.costSize + t.costLife;
    await this.actor.update({
      [`system.totemCosts.creation.costDuration`]: data.cost,
      [`system.totemCosts.creation.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Destructive - Totem
    * -------------------------------------------- */
  async _selectDestructiveDB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.destructive;
    const total = Number(data.cost) + t.costDamageNumber + t.costDamageDice + t.costResistance + t.costHeavy;
    await this.actor.update({
      [`system.totemCosts.destructive.costBase`]: data.cost,
      [`system.totemCosts.destructive.costTotal`]: total
    })
  }
  async _selectDestructiveDN(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.destructive;
    const total = Number(data.cost) + t.costBase + t.costDamageDice + t.costResistance + t.costHeavy;
    await this.actor.update({
      [`system.totemCosts.destructive.costDamageNumber`]: data.cost,
      [`system.totemCosts.destructive.costTotal`]: total
    })
  }
  async _selectDestructiveDD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.destructive;
    const total = Number(data.cost) + t.costBase + t.costDamageNumber + t.costResistance + t.costHeavy;
    await this.actor.update({
      [`system.totemCosts.destructive.costDamageDice`]: data.cost,
      [`system.totemCosts.destructive.costTotal`]: total
    })
  }
  async _selectDestructiveDR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.destructive;
    const total = Number(data.cost) + t.costBase + t.costDamageNumber + t.costDamageDice + t.costHeavy;
    await this.actor.update({
      [`system.totemCosts.destructive.costResistance`]: data.cost,
      [`system.totemCosts.destructive.costTotal`]: total
    })
  }
  async _selectDestructiveDH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.destructive;
    const total = Number(data.cost) + t.costBase + t.costDamageNumber + t.costDamageDice + t.costResistance;
    await this.actor.update({
      [`system.totemCosts.destructive.costHeavy`]: data.cost,
      [`system.totemCosts.destructive.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Healing - Totem
    * -------------------------------------------- */
  async _selectHealingHB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.healing;
    const total = Number(data.cost) + t.costHealing;
    await this.actor.update({
      [`system.totemCosts.healing.costBase`]: data.cost,
      [`system.totemCosts.healing.costTotal`]: total
    })
  }
  async _selectHealingHH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.healing;
    const total = Number(data.cost) + t.costBase;
    await this.actor.update({
      [`system.totemCosts.healing.costHealing`]: data.cost,
      [`system.totemCosts.healing.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Protective - Totem
    * -------------------------------------------- */
  async _selectProtectivePB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.protective;
    const total = Number(data.cost) + t.costArmorRating + t.costHeavy + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.protective.costBase`]: data.cost,
      [`system.totemCosts.protective.costTotal`]: total
    })
  }
  async _selectProtectivePA(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.protective;
    const total = Number(data.cost) + t.costBase + t.costHeavy + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.protective.costArmorRating`]: data.cost,
      [`system.totemCosts.protective.costTotal`]: total
    })
  }
  async _selectProtectivePH(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.protective;
    const total = Number(data.cost) + t.costBase + t.costArmorRating + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.protective.costHeavy`]: data.cost,
      [`system.totemCosts.protective.costTotal`]: total
    })
  }
  async _selectProtectivePD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.protective;
    const total = Number(data.cost) + t.costBase + t.costArmorRating + t.costHeavy;
    await this.actor.update({
      [`system.totemCosts.protective.costDuration`]: data.cost,
      [`system.totemCosts.protective.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Reduction - Totem
    * -------------------------------------------- */
  async _selectReductionRB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.reduction;
    const total = Number(data.cost) + t.costSkill + t.costResistance + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.reduction.costBase`]: data.cost,
      [`system.totemCosts.reduction.costTotal`]: total
    })
  }
  async _selectReductionRS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.reduction;
    const total = Number(data.cost) + t.costBase + t.costResistance + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.reduction.costSkill`]: data.cost,
      [`system.totemCosts.reduction.costTotal`]: total
    })
  }
  async _selectReductionRR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.reduction;
    const total = Number(data.cost) + t.costBase + t.costSkill + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.reduction.costResistance`]: data.cost,
      [`system.totemCosts.reduction.costTotal`]: total
    })    
  }
  async _selectReductionRD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.reduction;
    const total = Number(data.cost) + t.costBase + t.costSkill + t.costResistance;
    await this.actor.update({
      [`system.totemCosts.reduction.costDuration`]: data.cost,
      [`system.totemCosts.reduction.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Summoning - Totem
    * -------------------------------------------- */
  async _selectSummoningSB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.summoning;
    const total = Number(data.cost) + t.costSize + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.summoning.costBase`]: data.cost,
      [`system.totemCosts.summoning.costTotal`]: total
    })
  }
  async _selectSummoningSS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.summoning;
    const total = Number(data.cost) + t.costBase + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.summoning.costSize`]: data.cost,
      [`system.totemCosts.summoning.costTotal`]: total
    })
  }
  async _selectSummoningSD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.summoning;
    const total = Number(data.cost) + t.costBase + t.costSize;
    await this.actor.update({
      [`system.totemCosts.summoning.costDuration`]: data.cost,
      [`system.totemCosts.summoning.costTotal`]: total
    })
  }
  /* --------------------------------------------
    * Radio Button Transformation - Totem
    * -------------------------------------------- */
  async _selectTransformationTB(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.transformation;
    const total = Number(data.cost) + t.costSize + t.costResistance + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.transformation.costBase`]: data.cost,
      [`system.totemCosts.transformation.costTotal`]: total
    })
  }
  async _selectTransformationTS(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.transformation;
    const total = Number(data.cost) + t.costBase + t.costResistance + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.transformation.costSize`]: data.cost,
      [`system.totemCosts.transformation.costTotal`]: total
    })
  }
  async _selectTransformationTR(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.transformation;
    const total = Number(data.cost) + t.costBase + t.costSize + t.costDuration;
    await this.actor.update({
      [`system.totemCosts.transformation.costResistance`]: data.cost,
      [`system.totemCosts.transformation.costTotal`]: total
    })
  }
  async _selectTransformationTD(event) {
    event.preventDefault();
    const data = event.currentTarget.dataset;
    const t = this.actor.system.totemCosts.transformation;
    const total = Number(data.cost) + t.costBase + t.costSize + t.costResistance;
    await this.actor.update({
      [`system.totemCosts.transformation.costDuration`]: data.cost,
      [`system.totemCosts.transformation.costTotal`]: total
    })
  }
}
