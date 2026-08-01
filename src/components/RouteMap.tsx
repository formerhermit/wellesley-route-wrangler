import { useEffect, useMemo, useRef, useState } from "react";
import { Goose, Treaters } from "./MapSprites";
import { JunctionButtons, MapJunctions } from "./MapJunctions";
import { MapLandmarks } from "./MapLandmarks";
import { MapRoads } from "./MapRoads";
import { PigeonGroup } from "./PigeonGroup";
import { RunnerGroup } from "./RunnerGroup";
import { RUNNER_COUNT, useRunAnimation } from "../hooks/useRunAnimation";
import { paceOf } from "../game/pace";
import {
  nodeById,
  routeMilestones,
  routePathData,
  selectableNodeIds,
} from "../game/routeGraph";
import type { Level, Route } from "../game/types";

interface Props {
  level: Level;
  route: Route;
  running: boolean;
  rejectedNodeId: string | null;
  reducedMotion: boolean;
  onSelect: (nodeId: string) => void;
  onRunFinished: () => void;
}

export function RouteMap({
  level,
  route,
  running,
  rejectedNodeId,
  reducedMotion,
  onSelect,
  onRunFinished,
}: Props) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const runnersRef = useRef<(SVGGElement | null)[]>(
    Array.from({ length: RUNNER_COUNT }, () => null),
  );
  const followerRef = useRef<SVGGElement | null>(null);
  const [alarmedNodeId, setAlarmedNodeId] = useState<string | null>(null);

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

  // Where the follower waits, and how far along the route it will be passed.
  // Null when this route never goes that way, which leaves it standing there.
  const follower = useMemo(() => {
    if (!level.follower) return undefined;
    const node = nodeById(level, level.follower.nodeId);
    const passed = routeMilestones(level, route).find(
      (milestone) => milestone.nodeId === level.follower?.nodeId,
    );
    return {
      ref: followerRef,
      home: { x: node.x + level.follower.dx, y: node.y + level.follower.dy },
      joinFraction: passed?.fraction ?? null,
    };
  }, [level, route]);

  const pace = useMemo(() => paceOf(level, route), [level, route]);

  const { start, cancel } = useRunAnimation({
    pathRef,
    pace,
    runnersRef,
    reducedMotion,
    milestones,
    follower,
    onReachHotspot: setAlarmedNodeId,
    onFinish: onRunFinished,
  });

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
        <MapLandmarks level={level} />
        <MapRoads level={level} route={route} />
        {/* The few landmarks that have nowhere to stand a road does not
            already cross, drawn over the top of it instead. */}
        <MapLandmarks level={level} onTop />

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

        {/* Above the junctions, because it ends up running over them. */}
        {follower && (
          <g
            ref={followerRef}
            aria-hidden="true"
            transform={`translate(${follower.home.x} ${follower.home.y})`}
          >
            {level.follower?.kind === "treaters" ? (
              // Drawn standing on their junction rather than above it, and
              // smaller: they are following, not looming.
              <g transform="scale(0.7) translate(0 -14)">
                <Treaters />
              </g>
            ) : (
              <Goose />
            )}
          </g>
        )}

        <RunnerGroup runnersRef={runnersRef} />
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
    </div>
  );
}
