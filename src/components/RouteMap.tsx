import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { CarolSingers, Dog, Goose, Treaters } from "./MapSprites";
import { JunctionButtons, MapJunctions } from "./MapJunctions";
import { MapLandmarks } from "./MapLandmarks";
import { MapRoads } from "./MapRoads";
import { PigeonGroup } from "./PigeonGroup";
import { RivalRunners } from "./RivalRunners";
import { WanderingGnome } from "./WanderingGnome";
import { RunnerGroup } from "./RunnerGroup";
import { RUNNER_COUNT, useRunAnimation } from "../hooks/useRunAnimation";
import { eggResponds, hasTrackEgg } from "../game/eggs";
import type { GnomeHome } from "../game/eggs";
import { paceOf } from "../game/pace";
import {
  nodeById,
  routeMilestones,
  routePathData,
  selectableNodeIds,
} from "../game/routeGraph";
import type { Level, Route } from "../game/types";

type FollowerKind = NonNullable<Level["followers"]>[number]["kind"];

/**
 * What a follower looks like standing by the road. The goose is drawn to its
 * own scale where the map has room for it; the crowds are drawn on their
 * junction rather than above it, and smaller, because they are following
 * rather than looming.
 */
function FollowerSprite({
  kind,
  scale,
}: {
  kind: FollowerKind;
  scale?: number;
}) {
  if (kind === "treaters" || kind === "carollers") {
    return (
      <g transform="scale(0.7) translate(0 -14)">
        {kind === "treaters" ? <Treaters /> : <CarolSingers />}
      </g>
    );
  }
  // Drawn facing left as it was given to us, so it is turned to face the way
  // everything else on this map runs.
  if (kind === "dog") return <Dog flip />;
  return (
    <g transform={scale ? `scale(${scale})` : undefined}>
      <Goose />
    </g>
  );
}

interface Props {
  level: Level;
  route: Route;
  running: boolean;
  rejectedNodeId: string | null;
  reducedMotion: boolean;
  onSelect: (nodeId: string) => void;
  onRunFinished: () => void;
  /** Where the one gnome is, if he is on this map at all (#104). */
  gnome: GnomeHome | undefined;
  onGnomePressed: () => void;
}

export function RouteMap({
  level,
  route,
  running,
  rejectedNodeId,
  reducedMotion,
  onSelect,
  onRunFinished,
  gnome,
  onGnomePressed,
}: Props) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const runnersRef = useRef<(SVGGElement | null)[]>(
    Array.from({ length: RUNNER_COUNT }, () => null),
  );
  const [alarmedNodeId, setAlarmedNodeId] = useState<string | null>(null);

  /*
   * The easter eggs (#104). How many presses each one has had, keyed by level
   * and then by the egg's own id, so the same sprite in two places on one map
   * is two eggs and coming back to a map does not reset what you found.
   *
   * Deliberately not persisted and deliberately nowhere near `records`. An egg
   * is worth nothing, and the moment it were stored next to the run book
   * somebody would have to explain why it does not score.
   */
  const [pressed, setPressed] = useState<Record<string, number>>({});
  const [rivalsRunning, setRivalsRunning] = useState(false);

  const eggs = useMemo(
    () => ({
      pressed: (id: string) => pressed[`${level.id}|${id}`] ?? 0,
      press: (id: string, kind: string) => {
        setPressed((current) => {
          const key = `${level.id}|${id}`;
          const had = current[key] ?? 0;
          /*
           * Clamped here as well as in the handler that is only attached while
           * an egg is live. Two presses inside one React flush both see the old
           * count, and the Atlantic Wall's notch is drawn by an exact match on
           * three — so an overshoot to four does not merely waste a press, it
           * puts the missing chunk back.
           */
          if (!eggResponds(kind, had)) return current;
          return { ...current, [key]: had + 1 };
        });
        // The one egg that is more than an animation: it sends a rival club
        // round the Hockey Loop, which needs a path and a clock of its own.
        if (kind === "track" && hasTrackEgg(level)) setRivalsRunning(true);
      },
    }),
    [level, pressed],
  );

  // One ref per follower the level declares, replaced when the level changes.
  const followerRefs = useMemo(
    () =>
      (level.followers ?? []).map(
        () => ({ current: null }) as RefObject<SVGGElement | null>,
      ),
    [level],
  );

  const selectable = useMemo(
    () => selectableNodeIds(level, route),
    [level, route],
  );
  const pathData = routePathData(level, route);

  const milestones = useMemo(
    () =>
      routeMilestones(level, route).filter(
        (milestone) => nodeById(level, milestone.nodeId).type === "pigeon",
      ),
    [level, route],
  );

  // Where each follower waits, and how far along the route it will be passed.
  // Null when this route never goes that way, which leaves it standing there.
  const followers = useMemo(() => {
    const milestones = routeMilestones(level, route);
    return (level.followers ?? []).map((waiting, index) => {
      const node = nodeById(level, waiting.nodeId);
      const passed = milestones.find(
        (milestone) => milestone.nodeId === waiting.nodeId,
      );
      return {
        ref: followerRefs[index],
        home: { x: node.x + waiting.dx, y: node.y + waiting.dy },
        joinFraction: passed?.fraction ?? null,
      };
    });
  }, [level, route, followerRefs]);

  const pace = useMemo(() => paceOf(level, route), [level, route]);

  const { start, cancel } = useRunAnimation({
    pathRef,
    pace,
    runnersRef,
    reducedMotion,
    milestones,
    followers,
    onReachHotspot: setAlarmedNodeId,
    onFinish: onRunFinished,
  });

  // Changing map takes the rivals with it: their circuit is this level's roads,
  // and a lap half-run on Loopy means nothing on Fleet Pond.
  useEffect(() => {
    setRivalsRunning(false);
  }, [level]);

  useEffect(() => {
    if (!running) return;
    start();
    return () => {
      cancel();
      setAlarmedNodeId(null);
    };
  }, [running, start, cancel]);

  // Counted, not stated: the description is the only version of the map a
  // screen reader gets, so it must not go stale when a level is added.
  // An unstarted route still holds the start junction, so it has to be tested
  // on the roads taken — otherwise "empty" never gets said and the description
  // opens by naming a junction nobody has run to yet.
  const description = `A schematic map of ${level.nodes.length} junctions. Your route is currently ${
    route.roadIds.length === 0
      ? "empty"
      : route.nodeIds.map((id) => nodeById(level, id).label).join(", then ")
  }.`;

  return (
    <div className="map">
      <div className="map-stage">
      <svg
        viewBox={`0 0 ${level.view.width} ${level.view.height}`}
        className={`map-svg${level.mood ? ` map-svg--${level.mood}` : ""}${
          running ? " is-running" : ""
        }`}
        role="img"
        aria-labelledby="map-title map-description"
      >
        <title id="map-title">{level.title} route map</title>
        <desc id="map-description">{description}</desc>

        {/* Open country is green underfoot; a town is not. */}
        <rect
          x={0}
          y={0}
          width={level.view.width}
          height={level.view.height}
          className={`map-ground map-ground--${level.theme}`}
        />
        <MapLandmarks level={level} eggs={eggs} />
        <MapRoads level={level} route={route} />
        {/* The few landmarks that have nowhere to stand a road does not
            already cross, drawn over the top of it instead. */}
        <MapLandmarks level={level} onTop />
        <WanderingGnome level={level} home={gnome} onPress={onGnomePressed} />

        {pathData && (
          <>
            <path ref={pathRef} className="route-line" d={pathData} />
            <path className="route-line route-line--top" d={pathData} />
          </>
        )}

        <PigeonGroup
          level={level}
          alarmedNodeId={alarmedNodeId}
          reducedMotion={reducedMotion}
        />
        <MapJunctions
          level={level}
          route={route}
          selectable={selectable}
          locked={running}
          rejectedNodeId={rejectedNodeId}
        />

        {/* Above the junctions, because they end up running over them. */}
        {(level.followers ?? []).map((waiting, index) => (
          <g
            key={`${waiting.kind}-${waiting.nodeId}`}
            ref={followerRefs[index]}
            aria-hidden="true"
            transform={`translate(${followers[index].home.x} ${followers[index].home.y})`}
          >
            <FollowerSprite kind={waiting.kind} scale={waiting.scale} />
          </g>
        ))}

        {/* Above the club's own runners, because they are quicker and the
            whole joke is that they go past. */}
        <RunnerGroup runnersRef={runnersRef} kit={level.kit} />
        <RivalRunners
          level={level}
          running={rivalsRunning}
          reducedMotion={reducedMotion}
          onFinish={() => setRivalsRunning(false)}
        />
      </svg>

        <JunctionButtons
          level={level}
          route={route}
          selectable={selectable}
          locked={running}
          rejectedNodeId={rejectedNodeId}
          onSelect={onSelect}
        />
      </div>

      {/*
        Every map is drawn wider than it is tall, so a phone held upright gives
        it about half the room a phone turned sideways does. Shown by CSS on a
        portrait phone and nowhere else — and left in the page for a screen
        reader either way, where it costs a line and reads as what it is.
      */}
      <p className="map-turn-hint">Turn your phone for a bigger map.</p>
    </div>
  );
}
