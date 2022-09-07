import "./App.css";
import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline } from "react-leaflet";
import { Box, Button, Slide, Text } from "@chakra-ui/react";
import AircraftPicker from "./AircraftPicker";

const SAN_FRANCISCO = {
    latitude: 37.7749,
    longitude: -122.4194,
    altitude_meters: 0,
};

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

function App() {
    const [nodes, setNodes] = useState(null);
    const [src, setSrc] = useState(null);
    const [dst, setDst] = useState(null);
    const [activeType, setActiveType] = useState("ArrowXl");
    const [edges, setEdges] = useState([]);
    const [routerInitialized, setRouterInitialized] = useState(false);
    const [route, setRoute] = useState(null);

    const onPickAircraft = (aircraftType) => {
        setRoute(null);
        setRouterInitialized(false);
        setActiveType(aircraftType);
    };

    const onRouterInitialized = (initialized) => {
        setRouterInitialized(initialized);
    };

    const onSetEdges = (edges) => {
        setEdges(edges);
    };

    const getRoute = () => {
        if (src == null || dst == null) {
            return;
        }
        fetch("http://localhost:8000/get-route", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "http://localhost:8000",
            },
            body: JSON.stringify({
                aircraft: activeType,
                from: src,
                to: dst,
            }),
        }).then((response) => {
            response.json().then((data) => {
                setRoute(data);
            });
        });
    };

    const onMarkerClick = (e) => {
        if (src == null) {
            // find the node with the nodeId
            console.log();
            setSrc(nodes.find((node) => node.uid === e.target.options.nodeId));
        } else if (dst == null) {
            setDst(nodes.find((node) => node.uid === e.target.options.nodeId));
        } else {
            setSrc(null);
            setDst(null);
            setRoute(null);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const queryObject = {
            location: SAN_FRANCISCO,
            radius: 500,
            capacity: 50,
        };
        setRouterInitialized(false);
        setRoute(null);

        // send a post request to http://localhost:8000/get-nearby-nodes with the queryObject
        // Access-Control-Allow-Origin in the header
        fetch("http://localhost:8000/get-nearby-nodes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "http://localhost:8000",
            },
            body: JSON.stringify(queryObject),
        })
            .then((response) => response.json())
            .then((data) => {
                setNodes(data);
            });
    };
    return (
        <div className="App">
            <div position="relative">
                <Slide
                    style={{
                        position: "absolute",
                        top: "25%",
                        width: "25%",
                        left: "0",
                        height: "50%",
                        zIndex: 1000,
                    }}
                    direction="left"
                    in
                >
                    <Box
                        roundedRight="2xl"
                        boxShadow="dark-lg"
                        bgColor="rgba(244, 244, 244)"
                        p={2}
                    >
                        <Text as="b" fontSize="xl" pt={20}>
                            Choose an Aircraft
                        </Text>
                        <AircraftPicker
                            imageUrl="arrow-xl.png"
                            title="Arrow XL"
                            body="Good for short range flights"
                            aircraftType="ArrowXl"
                            activeType={activeType}
                            onClick={onPickAircraft}
                            setEdges={onSetEdges}
                            routerInitialized={routerInitialized}
                            setRouterInitialized={onRouterInitialized}
                            nodes={nodes}
                            src={src}
                            dst={dst}
                            getRoute={getRoute}
                        />

                        <AircraftPicker
                            imageUrl="arrow-cargo.png"
                            title="Arrow Cargo"
                            body="Good for mid range flights with heavy payloads"
                            aircraftType="ArrowCargo"
                            activeType={activeType}
                            onClick={onPickAircraft}
                            setEdges={onSetEdges}
                            routerInitialized={routerInitialized}
                            setRouterInitialized={onRouterInitialized}
                            nodes={nodes}
                            src={src}
                            dst={dst}
                            getRoute={getRoute}
                        />
                    </Box>
                </Slide>

                <Box
                    style={{
                        position: "absolute",
                        top: "80%",
                        left: "0",
                        width: "100%",
                        height: "20%",
                        zIndex: 1000,
                    }}
                >
                    <Button
                        onClick={onSubmit}
                        top={50}
                        bgColor="black"
                        color="white"
                        boxShadow="dark-lg"
                        _hover={{ bg: "rgb(90, 92, 164)" }}
                    >
                        Get nearby nodes
                    </Button>
                </Box>
                <MapContainer
                    center={[SAN_FRANCISCO.latitude, SAN_FRANCISCO.longitude]}
                    zoom={13}
                    scrollWheelZoom
                    id="map"
                >
                    <TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png" />
                    {route != null && (
                        <Polyline
                            pathOptions={routeOptions}
                            positions={route.map((r) => [
                                r.latitude,
                                r.longitude,
                            ])}
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
            </div>
        </div>
    );
}

export default App;
