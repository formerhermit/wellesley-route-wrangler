import { currentNodeId } from "../game/routeGraph";
import type { Level, MapNode, Route } from "../game/types";

interface Props {
  level: Level;
  route: Route;
  selectable: Set<string>;
  locked: boolean;
  rejectedNodeId: string | null;
}

/** Long place names get two lines rather than one that leaves the map. */
function labelLines(label: string): string[] {
  if (label.length <= 18) return [label];
  const words = label.split(" ");
  const middle = Math.ceil(words.length / 2);
  return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
}

function junctionClasses(
  node: MapNode,
  { visited, isEnd, isSelectable, locked, rejected }: JunctionState,
): string {
  return [
    "junction",
    `junction--${node.type ?? "junction"}`,
    visited ? "is-visited" : "",
    isEnd ? "is-end" : "",
    isSelectable ? "is-selectable" : "",
    locked ? "is-locked" : "",
    rejected ? "is-rejected" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

interface JunctionState {
  visited: boolean;
  isEnd: boolean;
  isPrevious: boolean;
  isSelectable: boolean;
  locked: boolean;
  rejected: boolean;
}

function statesFor({
  level,
  route,
  selectable,
  locked,
  rejectedNodeId,
}: Props): Map<string, JunctionState> {
  const endId = currentNodeId(route);
  const previousId =
    route.nodeIds.length > 1 ? route.nodeIds[route.nodeIds.length - 2] : null;
  const visited = new Set(route.nodeIds);

  return new Map(
    level.nodes.map((node) => [
      node.id,
      {
        visited: visited.has(node.id),
        isEnd: node.id === endId,
        isPrevious: node.id === previousId,
        isSelectable: !locked && selectable.has(node.id),
        locked,
        rejected: rejectedNodeId === node.id,
      },
    ]),
  );
}

/**
 * The drawn junctions. Purely visual — the map's controls are real HTML
 * buttons in `JunctionButtons`, which screen readers handle far more reliably
 * than interactive SVG groups.
 */
export function MapJunctions(props: Props) {
  const { level, route } = props;
  const states = statesFor(props);
  const visitOrder = new Map<string, number>();
  route.nodeIds.forEach((id, index) => visitOrder.set(id, index));

  return (
    <g aria-hidden="true">
      {level.nodes.map((node) => {
        const state = states.get(node.id)!;
        const lines = labelLines(node.label);
        const above = node.labelAbove === true;

        return (
          // Outer group holds the position as an SVG attribute; the inner one
          // carries the classes, including the rejection wobble. A CSS
          // transform beats the transform attribute outright, so an animated
          // element must never also be positioned by one — the junction would
          // snap to the map's origin for the length of the animation.
          <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <g className={junctionClasses(node, state)}>
              <circle className="junction-halo" r={16} />
              <circle className="junction-dot" r={9} />
              {state.visited && (
                <text className="junction-step" y={4}>
                  {(visitOrder.get(node.id) ?? 0) + 1}
                </text>
              )}
              <text
                className="junction-label"
                y={above ? -30 - (lines.length - 1) * 13 : 32}
              >
                {lines.map((line, index) => (
                  <tspan key={line} x={0} dy={index === 0 ? 0 : 13}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

function accessibleName(
  level: Level,
  node: MapNode,
  route: Route,
  state: JunctionState,
): string {
  const parts = [node.label];
  if (node.blurb) parts.push(node.blurb);
  if (state.isEnd) parts.push("end of your route");
  if (state.isPrevious) parts.push("select to undo the last road");
  else if (state.isSelectable) parts.push("select to add this road");
  else if (!state.isEnd) parts.push("not joined to the end of your route");
  if (node.id === level.startNodeId && route.roadIds.length === 0) {
    parts.push("your route starts here");
  }
  return `${parts.join(", ")}.`;
}

/**
 * One button per junction, laid over the map. Percentage positioning keeps
 * them locked to the SVG's geometry at every viewport size.
 */
export function JunctionButtons(
  props: Props & { onSelect: (nodeId: string) => void },
) {
  const { level, route, locked, onSelect } = props;
  const states = statesFor(props);

  return (
    <div className="junction-buttons">
      {level.nodes.map((node) => {
        const state = states.get(node.id)!;
        return (
          <button
            key={node.id}
            type="button"
            className={`junction-button${state.isSelectable ? " is-selectable" : ""}`}
            style={{
              left: `${(node.x / level.view.width) * 100}%`,
              top: `${(node.y / level.view.height) * 100}%`,
            }}
            disabled={locked}
            aria-disabled={!state.isSelectable}
            aria-label={accessibleName(level, node, route, state)}
            onClick={() => onSelect(node.id)}
          />
        );
      })}
    </div>
  );
}
