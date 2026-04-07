import type { SubscriptionStatus } from "@/lib/types/database"

/** Statuses that grant full dashboard access */
const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "master"]

/** Trial still grants access (limited period) */
const ACCESS_STATUSES: SubscriptionStatus[] = ["active", "master", "trial"]

export function hasFullAccess(status: SubscriptionStatus): boolean {
  return ACTIVE_STATUSES.includes(status)
}

export function hasDashboardAccess(status: SubscriptionStatus): boolean {
  return ACCESS_STATUSES.includes(status)
}

export function isMaster(status: SubscriptionStatus): boolean {
  return status === "master"
}
