import type { ItemGroup } from './items';
import type { RuleId } from '../types';

export interface RuleDef {
  id: RuleId;
  title: string;
  text: string;
  action: 'DENY' | 'CONFISCATE' | 'DETAIN' | 'PAT-DOWN' | 'INFO';
  /** Item group this rule bans, if any. */
  group?: ItemGroup;
}

export const RULES: Record<RuleId, RuleDef> = {
  ticket_valid: {
    id: 'ticket_valid',
    title: 'Valid ticket',
    text: "Ticket must be for TODAY'S event and valid on today's date. Day tickets: that date only. Weekend/Camping/VIP: any day of the event.",
    action: 'DENY',
  },
  bag_weapons: { id: 'bag_weapons', title: 'Weapons', text: 'Knives, knuckle-dusters, batons.', action: 'DENY', group: 'weapon' },
  bag_glass: { id: 'bag_glass', title: 'Glass', text: 'Glass bottles, jars and glass perfume bottles.', action: 'CONFISCATE', group: 'glass' },
  id_required: {
    id: 'id_required',
    title: 'Photo ID',
    text: 'Driving licence or passport ONLY. Name must match the ticket, must be in date, and the photo must match the holder.',
    action: 'DENY',
  },
  age_18: { id: 'age_18', title: 'Over 18s only', text: 'Holder must be 18 or older today (check date of birth).', action: 'DENY' },
  bag_drugs: { id: 'bag_drugs', title: 'Illegal drugs', text: 'Any illegal substance, however it is disguised.', action: 'DENY', group: 'drug' },
  bag_aerosol: { id: 'bag_aerosol', title: 'Aerosols', text: 'Spray cans: deodorant, hairspray, spray paint.', action: 'CONFISCATE', group: 'aerosol' },
  medication: {
    id: 'medication',
    title: 'Prescription meds',
    text: 'Prescription pills need a prescription note: patient name must match ID, medicine must match the bottle label, note must be in date. Otherwise confiscate the pills.',
    action: 'CONFISCATE',
    group: 'medication',
  },
  detain: {
    id: 'detain',
    title: 'Detain offenders',
    text: 'Anyone carrying illegal drugs or weapons must be DETAINED (not just denied). Press the red DETAIN button.',
    action: 'DETAIN',
  },
  bag_unsealed: { id: 'bag_unsealed', title: 'Opened bottles', text: 'Plastic bottles must be factory sealed. Opened bottles are confiscated.', action: 'CONFISCATE', group: 'unsealed' },
  bag_alcohol: { id: 'bag_alcohol', title: 'Outside alcohol', text: 'Cans, flasks, boxed wine - all outside alcohol.', action: 'CONFISCATE', group: 'alcohol' },
  consent: {
    id: 'consent',
    title: 'Under 18s',
    text: "Under-18s are welcome but must hand over a Guardian Consent Form: child's name must match their ID and the form must be dated TODAY.",
    action: 'DENY',
  },
  bag_gadgets: { id: 'bag_gadgets', title: 'Nuisance gadgets', text: 'Laser pointers, selfie sticks, drones.', action: 'CONFISCATE', group: 'gadget' },
  camping: {
    id: 'camping',
    title: 'Camping gear',
    text: 'Tents & camping chairs are allowed ONLY with a CAMPING ticket.',
    action: 'CONFISCATE',
    group: 'camping',
  },
  k9: {
    id: 'k9',
    title: 'K9 unit',
    text: "If Sergeant (the sniffer dog) sits down, you must PAT-DOWN the attendee before deciding. Hidden contraband counts just like bag contents.",
    action: 'PAT-DOWN',
  },
  bag_pyro: { id: 'bag_pyro', title: 'Pyrotechnics', text: 'Flares and fireworks.', action: 'DENY', group: 'pyro' },
  bag_spikes: { id: 'bag_spikes', title: 'Spikes & chains', text: 'Spiked jewellery and heavy chains.', action: 'CONFISCATE', group: 'spikes' },
  seal: {
    id: 'seal',
    title: 'Hologram seal',
    text: "Counterfeits are circulating. Tickets must carry the correct hologram seal colour for this event (see TODAY page).",
    action: 'DENY',
  },
  ticket_code: {
    id: 'ticket_code',
    title: 'Ticket number',
    text: 'Ticket numbers must begin with the event code (see TODAY page), e.g. IRN-12345-X.',
    action: 'DENY',
  },
  guestlist: {
    id: 'guestlist',
    title: 'Artist & crew passes',
    text: 'Pass holders need no ticket, but must appear on the GUEST LIST and show matching photo ID.',
    action: 'DENY',
  },
};

/** Maps an item group to the rule that bans it. */
export const GROUP_RULE: Partial<Record<ItemGroup, RuleId>> = {
  weapon: 'bag_weapons',
  glass: 'bag_glass',
  drug: 'bag_drugs',
  aerosol: 'bag_aerosol',
  medication: 'medication',
  unsealed: 'bag_unsealed',
  alcohol: 'bag_alcohol',
  gadget: 'bag_gadgets',
  camping: 'camping',
  pyro: 'bag_pyro',
  spikes: 'bag_spikes',
};
