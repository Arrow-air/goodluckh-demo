import "./App.css";
import React, { useState } from "react";
import { Box, Button, Slide } from "@chakra-ui/react";
import { AircraftSelectionPane } from "./components/AircraftSelectionPane";
import MapView from "./components/MapView";

const SAN_FRANCISCO = {
    latitude: 37.7749,
    longitude: -122.4194,
    altitude_meters: 0,
};

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
                    <AircraftSelectionPane
                        activeType={activeType}
                        onPickAircraft={onPickAircraft}
                        onSetEdges={onSetEdges}
                        routerInitialized={routerInitialized}
                        onRouterInitialized={onRouterInitialized}
                        nodes={nodes}
                        src={src}
                        dst={dst}
                        getRoute={getRoute}
                    />
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
                <MapView
                    centerLocation={SAN_FRANCISCO}
                    nodes={nodes}
                    route={route}
                    onMarkerClick={onMarkerClick}
                    src={src}
                    dst={dst}
                    edges={edges}
                />
            </div>
        </div>
    );
}

export default App;
