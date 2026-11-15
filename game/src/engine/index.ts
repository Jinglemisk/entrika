// The rules engine: pure functions over a plain JSON game state, shared by the server and the phones.
export { createGame, type SetupOptions } from './setup.ts';
export { act, FREE_POWERS, freePowerTargets } from './actions.ts';
export { legalTargets, playableForms, waveAllowance, canRecast } from './court.ts';
export { eligibleList, handLimit, companionUp, clockwise, seatOf, fieldsOpen } from './core.ts';
export * from './types.ts';
export * from './content.ts';
