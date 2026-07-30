import { useEffect, useMemo, useRef, useState } from "react";
import { JunctionButtons, MapJunctions } from "./MapJunctions";
import { MapLandmarks } from "./MapLandmarks";
import { MapRoads } from "./MapRoads";
import { PigeonGroup } from "./PigeonGroup";
import { RunnerGroup } from "./RunnerGroup";
import { RUNNER_COUNT, useRunAnimation } from "../hooks/useRunAnimation";
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

  const { start, cancel } = useRunAnimation({
    pathRef,
    runnersRef,
    reducedMotion,
    milestones,
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

  const description = `A schematic map of twelve junctions. Your route is currently ${
    route.nodeIds.map((id) => nodeById(level, id).label).join(", then ") ||
    "empty"
  }.`;

  return (
    <div className="map">
      <div className="map-stage">
      <svg
        viewBox={`0 0 ${level.view.width} ${level.view.height}`}
        className={`map-svg${running ? " is-running" : ""}`}
        role="img"
        aria-labelledby="map-title map-description"
      >
        <title id="map-title">{level.title} route map</title>
        <desc id="map-description">{description}</desc>

        <rect
          x={0}
          y={0}
          width={level.view.width}
          height={level.view.height}
          className="map-ground"
        />
        <MapLandmarks level={level} />
        <MapRoads level={level} route={route} />

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
