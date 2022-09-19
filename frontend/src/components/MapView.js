import { MapContainer, TileLayer, CircleMarker, Polyline } from "react-leaflet";

const blackOptions = { color: "black" };
const edgeOptions = {
    color: "gray",
    weight: 1,
    opacity: 0.6,
    smoothFactor: 1,
};
const routeOptions = {
    color: "black",
    weight: 5,
    opacity: 0.7,
    smoothFactor: 1,
};
const redOptions = { color: "red" };
const blueOptions = { color: "blue" };

export default function MapView(props) {
    const { centerLocation, nodes, route, onMarkerClick, src, dst, edges } =
        props;

    return (
        <MapContainer
            center={[centerLocation.latitude, centerLocation.longitude]}
            zoom={13}
            scrollWheelZoom
            id="map"
        >
            <TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png" />
            {route != null && (
                <Polyline
                    pathOptions={routeOptions}
                    positions={route.map((r) => [r.latitude, r.longitude])}
                />
            )}
            {nodes != null &&
                nodes.map((node) => (
                    <CircleMarker
                        center={[
                            node.location.latitude,
                            node.location.longitude,
                        ]}
                        eventHandlers={{
                            click: (e) => onMarkerClick(e),
                        }}
                        pathOptions={
                            src && src.uid === node.uid
                                ? redOptions
                                : dst && dst.uid === node.uid
                                ? blueOptions
                                : blackOptions
                        }
                        radius={
                            src && src.uid === node.uid
                                ? 10
                                : dst && dst.uid === node.uid
                                ? 10
                                : 5
                        }
                        nodeId={node.uid}
                        key={node.uid}
                    />
                ))}
            {
                <Polyline
                    positions={edges
                        .map((edge) => [
                            [
                                edge.from.location.latitude,
                                edge.from.location.longitude,
                            ],
                            [
                                edge.to.location.latitude,
                                edge.to.location.longitude,
                            ],
                        ])
                        .flat()}
                    pathOptions={edgeOptions}
                />
            }
        </MapContainer>
    );
}
