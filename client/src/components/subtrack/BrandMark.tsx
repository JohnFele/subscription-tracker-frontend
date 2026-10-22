const brandSlugs: Record<string, string> = {
  "the new york times": "newyorktimes",
  "new york times": "newyorktimes",
  nyt: "newyorktimes",
  "youtube premium": "youtube",
  "adobe creative cloud": "adobecreativecloud",
  "adobe cc": "adobecreativecloud",
  "google drive": "googledrive",
  "disney+": "disneyplus",
  classpass: "classpass",
};

const brandColors: Record<string, string> = {
  netflix: "#e50914",
  spotify: "#1db954",
  figma: "#a259ff",
  "youtube premium": "#ff0033",
  youtube: "#ff0033",
  notion: "#161616",
  headspace: "#f47b44",
  "the new york times": "#141414",
  "new york times": "#141414",
  "adobe creative cloud": "#ed1c24",
  "adobe cc": "#ed1c24",
  classpass: "#f05550",
  "disney+": "#1637b7",
  calm: "#698acb",
};

function brandKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "");
}

export function BrandMark({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const key = brandKey(name);
  const slug =
    brandSlugs[key] ??
    key
      .replace(/\+/g, " plus ")
      .replace(/\./g, " dot ")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]/g, "");
  const color = brandColors[key] ?? "#738778";

  return (
    <div
      className={`brand-mark ${large ? "brand-mark-lg" : ""}`}
      style={{ "--brand": color } as React.CSSProperties}
    >
      <img
        key={slug}
        src={`https://cdn.simpleicons.org/${slug}?viewbox=auto&size=32`}
        alt=""
        loading="lazy"
        decoding="async"
        onError={event => {
          event.currentTarget.style.display = "none";
        }}
      />
      <span>{name.charAt(0)}</span>
    </div>
  );
}
