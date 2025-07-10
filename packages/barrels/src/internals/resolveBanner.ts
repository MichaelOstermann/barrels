import type { BarrelConfig } from "../types"
import { Barrel } from "../Barrel"

export function resolveBanner({ banner }: BarrelConfig): string {
    if (typeof banner === "string") return banner
    if (banner === false) return ""
    return Barrel.ignoresHeader
}
