/** Dashboard palette: white page, flat grey cards, purple brand accent, green/red only for meaning. */
export const nu = {
  brand: "#820AD1",
  brandDeep: "#6E08B3",
  brandTint: "#F3E8FC",
  ink: "#1F1F24",
  inkSoft: "#6B6B76",
  inkFaint: "#9A9AA5",
  surface: "#F5F5F8",
  surfacePressed: "#E9E9EF",
  track: "#E4E4EB",
  hairline: "#ECECF1",
  positive: "#1E8A5A",
  positiveTint: "#E3F4EB",
  negative: "#C2412D",
  negativeTint: "#FBE7E3",
  white: "#FFFFFF",
} as const;

/** Shared section chrome so every dashboard block reads the same. */
export const nuSection = {
  container: { borderTopColor: nu.hairline, borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 22 },
  title: { color: nu.ink, fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
  subtitle: { color: nu.inkSoft, fontSize: 13, marginTop: 3 },
  dots: { alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 14 },
  dot: { backgroundColor: "#D9D9E0", borderRadius: 3, height: 6, width: 6 },
  activeDot: { backgroundColor: nu.brand, width: 18 },
} as const;

/** Carousel cards span the section's inner width (20px gutter each side). */
export const SECTION_GUTTER = 40;
