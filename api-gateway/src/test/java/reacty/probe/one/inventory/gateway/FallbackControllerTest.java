package reacty.probe.one.inventory.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.reactive.server.WebTestClient;
import reacty.probe.one.inventory.gateway.controller.FallbackController;

@WebFluxTest(FallbackController.class)
class FallbackControllerTest {

    @Autowired
    WebTestClient webTestClient;

    @Test
    void ordersFallback_returnsServiceUnavailable() {
        webTestClient.get()
                .uri("/fallback/orders")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SERVICE_UNAVAILABLE");
    }

    @Test
    void inventoryFallback_returnsServiceUnavailable() {
        webTestClient.get()
                .uri("/fallback/inventory")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SERVICE_UNAVAILABLE");
    }

    @Test
    void deliveriesFallback_returnsServiceUnavailable() {
        webTestClient.get()
                .uri("/fallback/deliveries")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SERVICE_UNAVAILABLE");
    }
}
