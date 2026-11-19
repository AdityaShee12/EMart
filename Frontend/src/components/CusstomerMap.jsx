import { useEffect } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";


// Routing Component
const RoutingMachine = ({
    deliveryLocation,
    buyerLocation
}) => {

    const map = useMap();

    useEffect(() => {

        if (!deliveryLocation || !buyerLocation) return;

        const deliveryLat = Number(deliveryLocation.latitude);
        const deliveryLng = Number(deliveryLocation.longitude);

        const buyerLat = Number(buyerLocation.latitude);
        const buyerLng = Number(buyerLocation.longitude);

        // Check valid coordinates
        if (
            !Number.isFinite(deliveryLat) ||
            !Number.isFinite(deliveryLng) ||
            !Number.isFinite(buyerLat) ||
            !Number.isFinite(buyerLng)
        ) {
            return;
        }

        // Create route
        const routingControl = L.Routing.control({

            // Starting point: Delivery Man
            // Destination: Buyer
            waypoints: [
                L.latLng(deliveryLat, deliveryLng),
                L.latLng(buyerLat, buyerLng)
            ],

            // Route line design
            lineOptions: {
                styles: [
                    {
                        color: "#2563eb",
                        weight: 6,
                        opacity: 0.8
                    }
                ]
            },

            // Hide default routing markers
            createMarker: () => null,

            addWaypoints: false,

            draggableWaypoints: false,

            routeWhileDragging: false,

            fitSelectedRoutes: true,

            show: false,

            // OSRM routing service
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1"
            })

        }).addTo(map);


        // Cleanup
        return () => {
            map.removeControl(routingControl);
        };

    }, [
        map,
        deliveryLocation?.latitude,
        deliveryLocation?.longitude,
        buyerLocation?.latitude,
        buyerLocation?.longitude
    ]);

    return null;
};


// Main Map Component
const DeliveryMap = ({
    deliveryLocation,
    buyerLocation
}) => {

    // Initial map position
    const center = buyerLocation ? [
        Number(buyerLocation.latitude),
        Number(buyerLocation.longitude)
    ]
        : [22.5726, 88.3639];

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{
                height: "500px",
                width: "100%"
            }}
        >
            {/* OpenStreetMap */}
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {/* Buyer Marker */}
            {buyerLocation && (

                <Marker
                    position={[
                        buyerLocation.latitude,
                        buyerLocation.longitude
                    ]}
                >

                    <Popup>
                        <strong>Buyer Location</strong>
                        <br />
                        Delivery Destination
                    </Popup>

                </Marker>

            )}

            {/* Delivery Man Marker */}
            {deliveryLocation && (

                <Marker
                    position={[
                        deliveryLocation.latitude,
                        deliveryLocation.longitude
                    ]}
                >

                    <Popup>
                        <strong>Delivery Man</strong>
                        <br />
                        Current Location
                    </Popup>

                </Marker>

            )}

            {/* Routing */}
            {deliveryLocation && buyerLocation && (

                <RoutingMachine
                    deliveryLocation={deliveryLocation}
                    buyerLocation={buyerLocation}
                />

            )}
        </MapContainer>
    );
};

export default DeliveryMap;