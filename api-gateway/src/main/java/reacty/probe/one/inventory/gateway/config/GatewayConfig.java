package reacty.probe.one.inventory.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("order-service", r -> r
                        .path("/api/orders/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("orderServiceCB")
                                        .setFallbackUri("forward:/fallback/orders")))
                        .uri("lb://order-service"))
                .route("inventory-service", r -> r
                        .path("/api/inventory/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("inventoryServiceCB")
                                        .setFallbackUri("forward:/fallback/inventory")))
                        .uri("lb://inventory-service"))
                .route("delivery-service", r -> r
                        .path("/api/deliveries/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("deliveryServiceCB")
                                        .setFallbackUri("forward:/fallback/deliveries")))
                        .uri("lb://delivery-service"))
                .build();
    }
}
