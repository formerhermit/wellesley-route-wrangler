import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { CarolSingers, Dog, Goose, Treaters } from "./MapSprites";
import { JunctionButtons, MapJunctions } from "./MapJunctions";
import { MapLandmarks } from "./MapLandmarks";
import { MapRoads } from "./MapRoads";
import { PhotoFlash } from "./PhotoFlash";
import { PigeonGroup } from "./PigeonGroup";
import { RaceField } from "./RaceField";
import { RivalRunners } from "./RivalRunners";
import { WanderingGnome } from "./WanderingGnome";
import { RunnerGroup } from "./RunnerGroup";
import { RUNNER_COUNT, useRunAnimation } from "../hooks/useRunAnimation";
import { eggResponds, hasTrackEgg } from "../game/eggs";
import type { GnomeHome } from "../game/eggs";
import { paceOf } from "../game/pace";
import { raceField } from "../game/raceField";
import {
  nodeById,
  routeMilestones,
  routePathData,
  selectableNodeIds,
} from "../game/routeGraph";
import { wanderRoll, wanderRoute } from "../game/wander";
import type { CardWeather } from "../game/cards";
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
  /** A little "juice" when a scattered egg (#104) actually answers a press. */
  onEggPressed?: () => void;
  /**
   * Junctions the group stands still at, from the briefing (#10). Handed
   * straight to `paceOf`, which is the only thing that needs to know: the
   * runners, the followers and a whole race field all read their position off
   * that one curve, so they stop and set off together without being told.
   */
  stops?: string[];
  /**
   * Which of those stops are photographs (#10). A subset of `stops`: the
   * group has to be standing still to be in the picture.
   */
  photoStops?: string[];
  /** What a card has done to the sky (#10). Decorative from end to end. */
  weather?: CardWeather;
  /** Club runners beyond the usual five, from a card. Decorative too. */
  extraRunners?: number;
  /** Nobody is navigating (#10). The group runs everywhere but the route. */
  wander?: boolean;
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
  onEggPressed,
  stops,
  photoStops,
  weather,
  extraRunners = 0,
  wander = false,
}: Props) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const runnerCount = RUNNER_COUNT + extraRunners;
  const runnersRef = useRef<(SVGGElement | null)[]>(
    Array.from({ length: runnerCount }, () => null),
  );
  // A card can bring more out, so the slots follow the turnout rather than
  // being fixed at the club's usual five.
  if (runnersRef.current.length !== runnerCount) {
    runnersRef.current = Array.from({ length: runnerCount }, () => null);
  }
  const [alarmedNodeId, setAlarmedNodeId] = useState<string | null>(null);
  /*
   * The camera going off, and when. The timestamp is only there to be a key:
   * a second photograph at the same junction has to restart the animation
   * rather than leave the first one's finished frame on screen.
   */
  const [flash, setFlash] = useState<{ nodeId: string; at: number } | null>(
    null,
  );

  // The rest of the race, where there is one (#111). An empty list on every
  // other map, which costs a component that draws nothing.
  const field = useMemo(() => raceField(level.field ?? 0), [level]);
  const fieldRef = useRef<(SVGGElement | null)[]>([]);
  if (fieldRef.current.length !== field.length) {
    fieldRef.current = Array.from({ length: field.length }, () => null);
  }

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
        onEggPressed?.();
      },
    }),
    [level, pressed, onEggPressed],
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

  /*
   * What the group runs, as against what the player drew. The same thing on
   * every ordinary evening; with nobody navigating (#10), the route plus
   * every wrong turning they take off it.
   *
   * Never under reduced motion. A wander is direction reversals by
   * definition, and reversals are the one thing that setting exists to spare
   * people — so the group finds its way after all, which is the right way for
   * this joke to fail.
   */
  const runRoute = useMemo(
    () =>
      wander && !reducedMotion
        ? wanderRoute(level, route, wanderRoll(route))
        : route,
    [wander, reducedMotion, level, route],
  );
  const runPathData = routePathData(level, runRoute);

  const milestones = useMemo(
    () =>
      routeMilestones(level, runRoute).filter(
        (milestone) => nodeById(level, milestone.nodeId).type === "pigeon",
      ),
    [level, runRoute],
  );

  // Where each follower waits, and how far along the route it will be passed.
  // Null when this route never goes that way, which leaves it standing there.
  const followers = useMemo(() => {
    const milestones = routeMilestones(level, runRoute);
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
  }, [level, runRoute, followerRefs]);

  const pace = useMemo(
    () => paceOf(level, runRoute, stops),
    [level, runRoute, stops],
  );

  /*
   * Where the shutter goes. Withheld entirely under reduced motion: the flash
   * is a bright pulse over the whole map, which is exactly what that setting
   * is asking us not to do. The group still stands still for the photograph,
   * because that is the pace curve and not the drawing.
   */
  const photos = useMemo(() => {
    if (reducedMotion || !photoStops || photoStops.length === 0) return [];
    const wanted = new Set(photoStops);
    return routeMilestones(level, runRoute).filter((milestone) =>
      wanted.has(milestone.nodeId),
    );
  }, [reducedMotion, photoStops, level, runRoute]);

  const { start, cancel } = useRunAnimation({
    pathRef,
    pace,
    runnerCount,
    runnersRef,
    field,
    fieldRef,
    reducedMotion,
    milestones,
    photos,
    followers,
    onReachHotspot: setAlarmedNodeId,
    onPhoto: (nodeId) =>
      setFlash(nodeId ? { nodeId, at: Date.now() } : null),
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
      setFlash(null);
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
        /*
         * The level's own id goes on as a class so a map can overrule
         * something the mood decided for it. Frost hangs the junctions like
         * baubles, which is right for the Christmas Run and wrong for a
         * February road race — and there was no hook for a map to say so.
         */
        className={`map-svg map-svg--${level.id}${
          level.mood ? ` map-svg--${level.mood}` : ""
        }${weather ? ` map-svg--${weather}` : ""}${
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
        <MapLandmarks level={level} eggs={eggs} weather={weather} />
        <MapRoads level={level} route={route} />
        {/* The few landmarks that have nowhere to stand a road does not
            already cross, drawn over the top of it instead. */}
        <MapLandmarks level={level} onTop weather={weather} />
        <WanderingGnome level={level} home={gnome} onPress={onGnomePressed} />

        {pathData && (
          <>
            <path className="route-line" d={pathData} />
            <path className="route-line route-line--top" d={pathData} />
            {/* The rail the group is actually on, which is the drawn route
                itself unless nobody is navigating. Never painted: it exists
                to be measured, and on an ordinary evening it lies exactly
                under the line above it. */}
            <path ref={pathRef} className="route-rail" d={runPathData} />
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

        {/* Under the club, so that whatever the pack is doing the five blue
            vests stay findable in it. */}
        <RaceField field={field} fieldRef={fieldRef} />

        {/* Above the club's own runners, because they are quicker and the
            whole joke is that they go past. */}
        <RunnerGroup
          count={runnerCount}
          runnersRef={runnersRef}
          kit={level.kit}
          /* One colour, and only in a race: five club shades are a club on an
             empty road and five strangers in a field of thirty. */
          vest={level.field ? "vest-blue" : undefined}
        />
        <RivalRunners
          level={level}
          running={rivalsRunning}
          reducedMotion={reducedMotion}
          onFinish={() => setRivalsRunning(false)}
        />

        {/* Last, and over everything: a flash lights the whole map, including
            the writing on it. */}
        {flash && (
          <PhotoFlash
            key={flash.at}
            at={nodeById(level, flash.nodeId)}
            width={level.view.width}
            height={level.view.height}
          />
        )}
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
