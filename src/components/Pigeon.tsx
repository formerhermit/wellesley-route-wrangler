const PIGEON = `${import.meta.env.BASE_URL}sprites/pigeon-standing.png`;

/**
 * The club's least useful member (#103).
 *
 * Not the flock. The birds on the map are vector, they are an obstacle, and
 * the rules count them; this one is a bystander who turns up on the furniture
 * and has opinions. He is ornament everywhere he appears — `alt=""`, never the
 * thing being said — so a screen reader goes straight past him.
 *
 * One component rather than the path written out at each site, because there
 * are four of those now and the intrinsic size wants stating once.
 */
export function Pigeon({ className = "" }: { className?: string }) {
  return (
    <img
      className={`pigeon ${className}`.trim()}
      src={PIGEON}
      alt=""
      width={186}
      height={190}
    />
  );
}
