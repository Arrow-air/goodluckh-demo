use actix_web::{web, web::Json, App, HttpResponse, HttpServer};
use lib_router::{
    generator::generate_nodes_near,
    haversine,
    location::Location,
    node::Node,
    router::engine::{Algorithm, Router},
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct NearbyLocationQuery {
    location: Location,
    radius: f32,
    capacity: i32,
}

#[derive(Deserialize, Serialize)]
pub struct RouteQuery {
    aircraft: Aircraft,
    from: Node,
    to: Node,
}

#[derive(Deserialize, Serialize)]
pub enum Aircraft {
    ArrowXl,
    ArrowCargo,
    ArrowInterstate,
}

static mut NODES: Option<Vec<Node>> = None;

static mut ARROW_XL_ROUTER: Option<Router> = None;
static mut ARROW_CARGO_ROUTER: Option<Router> = None;
static mut ARROW_INTERSTATE_ROUTER: Option<Router> = None;

static ARROW_XL_CONSTRAINT: f32 = 25.0;
static ARROW_CARGO_CONSTRAINT: f32 = 75.0;
static ARROW_INTERSTATE_CONSTRAINT: f32 = 100.0;

/// Returns a list of nodes near the given location
pub async fn get_nearby_nodes(req: Json<NearbyLocationQuery>) -> HttpResponse {
    unsafe {
        ARROW_XL_ROUTER = None;
        ARROW_CARGO_ROUTER = None;
        ARROW_INTERSTATE_ROUTER = None;
        NODES = Some(generate_nodes_near(&req.location, req.radius, req.capacity));
        return HttpResponse::Ok().json(NODES.as_ref().unwrap());
    };
}

/// See if the router of the given aircraft has been initialized
pub async fn is_router_initialized(req: Json<Aircraft>) -> HttpResponse {
    unsafe {
        match req.into_inner() {
            Aircraft::ArrowXl => {
                if ARROW_XL_ROUTER.is_some() {
                    return HttpResponse::Ok().json(true);
                } else {
                    return HttpResponse::Ok().json(false);
                }
            }
            Aircraft::ArrowCargo => {
                if ARROW_CARGO_ROUTER.is_some() {
                    return HttpResponse::Ok().json(true);
                } else {
                    return HttpResponse::Ok().json(false);
                }
            }
            Aircraft::ArrowInterstate => {
                if ARROW_INTERSTATE_ROUTER.is_some() {
                    return HttpResponse::Ok().json(true);
                } else {
                    return HttpResponse::Ok().json(false);
                }
            }
        }
    }
}

/// Initializes the router for the given aircraft
pub async fn init_router(req: Json<Aircraft>) -> HttpResponse {
    if unsafe { NODES.is_none() } {
        return HttpResponse::InternalServerError()
            .body("Nodes not initialized. Try to get some nodes first.");
    }

    match req.into_inner() {
        Aircraft::ArrowXl => unsafe {
            if ARROW_XL_ROUTER.is_some() {
                return HttpResponse::Ok().body(
                    "Router already initialized. Try to use the router instead of initializing it.",
                );
            }
            ARROW_XL_ROUTER = Some(Router::new(
                &NODES.as_ref().unwrap(),
                ARROW_XL_CONSTRAINT,
                |from, to| haversine::distance(&from.as_node().location, &to.as_node().location),
                |from, to| haversine::distance(&from.as_node().location, &to.as_node().location),
            ));
            return HttpResponse::Ok().body("Arrow XL router initialized.");
        },
        Aircraft::ArrowCargo => unsafe {
            if ARROW_CARGO_ROUTER.is_some() {
                return HttpResponse::Ok().body(
                    "Router already initialized. Try to use the router instead of initializing it.",
                );
            }
            ARROW_CARGO_ROUTER = Some(Router::new(
                &NODES.as_ref().unwrap(),
                ARROW_CARGO_CONSTRAINT,
                |from, to| haversine::distance(&from.as_node().location, &to.as_node().location),
                |from, to| haversine::distance(&from.as_node().location, &to.as_node().location),
            ));
            return HttpResponse::Ok().body("Arrow Cargo router initialized.");
        },
        Aircraft::ArrowInterstate => unsafe {
            if ARROW_INTERSTATE_ROUTER.is_some() {
                return HttpResponse::Ok().body(
                    "Router already initialized. Try to use the router instead of initializing it.",
                );
            }
            ARROW_INTERSTATE_ROUTER = Some(Router::new(
                &NODES.as_ref().unwrap(),
                ARROW_INTERSTATE_CONSTRAINT,
                |from, to| haversine::distance(&from.as_node().location, &to.as_node().location),
                |from, to| haversine::distance(&from.as_node().location, &to.as_node().location),
            ));
            return HttpResponse::Ok().body("Arrow Interstate router initialized.");
        },
    }
}

/// Gets all edges in an aircraft's graph
pub async fn get_edges(req: Json<Aircraft>) -> HttpResponse {
    match req.into_inner() {
        Aircraft::ArrowXl => unsafe {
            if ARROW_XL_ROUTER.is_none() {
                return HttpResponse::InternalServerError()
                    .body("Arrow XL router not initialized. Try to initialize it first.");
            }
            return HttpResponse::Ok().json(ARROW_XL_ROUTER.as_ref().unwrap().get_edges());
        },
        Aircraft::ArrowCargo => unsafe {
            if ARROW_CARGO_ROUTER.is_none() {
                return HttpResponse::InternalServerError()
                    .body("Arrow Cargo router not initialized. Try to initialize it first.");
            }
            return HttpResponse::Ok().json(ARROW_CARGO_ROUTER.as_ref().unwrap().get_edges());
        },
        Aircraft::ArrowInterstate => unsafe {
            if ARROW_INTERSTATE_ROUTER.is_none() {
                return HttpResponse::InternalServerError()
                    .body("Arrow Interstate router not initialized. Try to initialize it first.");
            }
            return HttpResponse::Ok().json(ARROW_INTERSTATE_ROUTER.as_ref().unwrap().get_edges());
        },
    }
}

/// Get route
pub async fn get_route(req: Json<RouteQuery>) -> HttpResponse {
    match req.into_inner() {
        RouteQuery {
            aircraft: Aircraft::ArrowXl,
            from,
            to,
        } => unsafe {
            if ARROW_XL_ROUTER.is_none() {
                return HttpResponse::InternalServerError()
                    .body("Arrow XL router not initialized. Try to initialize it first.");
            }
            let (_, path) = ARROW_XL_ROUTER.as_ref().unwrap().find_shortest_path(
                &from,
                &to,
                Algorithm::Dijkstra,
                None,
            );
            let locations = path
                .iter()
                .map(|node_idx| {
                    ARROW_XL_ROUTER
                        .as_ref()
                        .unwrap()
                        .get_node_by_id(*node_idx)
                        .unwrap()
                        .location
                })
                .collect::<Vec<Location>>();
            return HttpResponse::Ok().json(locations);
        },
        RouteQuery {
            aircraft: Aircraft::ArrowCargo,
            from,
            to,
        } => unsafe {
            if ARROW_CARGO_ROUTER.is_none() {
                return HttpResponse::InternalServerError()
                    .body("Arrow XL router not initialized. Try to initialize it first.");
            }
            let (_, path) = ARROW_CARGO_ROUTER.as_ref().unwrap().find_shortest_path(
                &from,
                &to,
                Algorithm::Dijkstra,
                None,
            );
            let locations = path
                .iter()
                .map(|node_idx| {
                    ARROW_CARGO_ROUTER
                        .as_ref()
                        .unwrap()
                        .get_node_by_id(*node_idx)
                        .unwrap()
                        .location
                })
                .collect::<Vec<Location>>();
            return HttpResponse::Ok().json(locations);
        },
        RouteQuery {
            aircraft: Aircraft::ArrowInterstate,
            from,
            to,
        } => unsafe {
            if ARROW_INTERSTATE_ROUTER.is_none() {
                return HttpResponse::InternalServerError()
                    .body("Arrow XL router not initialized. Try to initialize it first.");
            }
            let (_, path) = ARROW_INTERSTATE_ROUTER
                .as_ref()
                .unwrap()
                .find_shortest_path(&from, &to, Algorithm::Dijkstra, None);
            let locations = path
                .iter()
                .map(|node_idx| {
                    ARROW_INTERSTATE_ROUTER
                        .as_ref()
                        .unwrap()
                        .get_node_by_id(*node_idx)
                        .unwrap()
                        .location
                })
                .collect::<Vec<Location>>();
            return HttpResponse::Ok().json(locations);
        },
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let server = HttpServer::new(|| {
        let cors = actix_cors::Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();
        App::new()
            .wrap(cors)
            .route("/get-nearby-nodes", web::post().to(get_nearby_nodes))
            .route("/init-router", web::post().to(init_router))
            .route(
                "/is-router-initialized",
                web::post().to(is_router_initialized),
            )
            .route("/get-edges", web::post().to(get_edges))
            .route("/get-route", web::post().to(get_route))
            .default_service(web::to(|| HttpResponse::NotFound()))
    });

    println!("Playground: http://localhost:8000");

    server
        .disable_signals()
        .bind(("0.0.0.0", 8000))?
        .run()
        .await
}
