import { Box, HStack, Image, VStack, Text, Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

function AircraftPicker(props) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!props.routerInitialized && props.nodes != null) {
            console.log("hello");
            setLoading(true);
            //fetch from is_router_initialized end point of port 8000 with post method
            fetch("http://localhost:8000/init-router", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "http://localhost:8000",
                },
                body: JSON.stringify(props.aircraftType),
            }).then((response) => {
                fetch("http://localhost:8000/get-edges", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "http://localhost:8000",
                    },
                    body: JSON.stringify(props.activeType),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        props.setEdges(data);
                        setLoading(false);
                    });

                props.setRouterInitialized(true);
                // send a post request to http://localhost:8000/get-edges with the aircraftType
                // Access-Control-Allow-Origin in the header
            });
        }
    });

    return (
        <Box
            p={2}
            m={3}
            rounded={12}
            boxShadow="lg"
            bgColor={
                props.activeType === props.aircraftType ? "white" : "gray.200"
            }
            borderColor={
                props.activeType === props.aircraftType
                    ? "rgb(90, 92, 164)"
                    : "gray.200"
            }
            borderWidth={4}
            cursor="pointer"
            onClick={() => props.onClick(props.aircraftType)}
            _hover={
                props.activeType === props.aircraftType
                    ? {}
                    : {
                          bgColor: "white",
                          borderColor: "rgb(90, 92, 164, 0.5)",
                      }
            }
        >
            <HStack>
                <Image boxSize="80px" src={props.imageUrl} />

                <VStack align="start" w="70%">
                    <Text as="b">{props.title}</Text>
                    <Text align="start" fontSize="sm" fontWeight={"medium"}>
                        {props.body}
                    </Text>
                </VStack>

                <Button
                    hidden={props.activeType !== props.aircraftType}
                    disabled={props.src == null || props.dst == null}
                    onClick={props.getRoute}
                >
                    Route
                </Button>
            </HStack>
        </Box>
    );
}

export default AircraftPicker;
