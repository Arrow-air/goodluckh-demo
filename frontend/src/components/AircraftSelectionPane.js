import { Box, Text } from "@chakra-ui/react";
import AircraftPicker from "./AircraftPicker";

export function AircraftSelectionPane(props) {
    const {
        activeType,
        onPickAircraft,
        onSetEdges,
        routerInitialized,
        onRouterInitialized,
        nodes,
        src,
        dst,
        getRoute,
    } = props;
    return (
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
    );
}
