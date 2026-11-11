/** Both agreements must be switched on before the user can continue. */
export function canAccept(health: boolean, privacy: boolean): boolean {
  return health && privacy;
}
