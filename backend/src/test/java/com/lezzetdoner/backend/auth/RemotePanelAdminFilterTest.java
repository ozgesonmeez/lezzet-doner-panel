package com.lezzetdoner.backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;

import static org.junit.jupiter.api.Assertions.*;

class RemotePanelAdminFilterTest {

    @Test
    void onlyAdminMenuEndpointsUseRemoteCheck() {
        var filter = new RemotePanelAdminFilter("https://example.up.railway.app/api/users");
        assertFalse(filter.shouldNotFilter(new MockHttpServletRequest("GET", "/api/menu/products")));
        assertFalse(filter.shouldNotFilter(new MockHttpServletRequest("POST", "/api/menu/images")));
        assertTrue(filter.shouldNotFilter(new MockHttpServletRequest("GET", "/api/public/menu")));
        assertTrue(filter.shouldNotFilter(new MockHttpServletRequest("GET", "/api/couriers/today")));
        assertTrue(filter.shouldNotFilter(new MockHttpServletRequest("POST", "/api/users")));
    }

    @Test
    void invalidConfigurationNeverGrantsRemoteAccess() throws Exception {
        var filter = new RemotePanelAdminFilter("http://unsafe.example/api/users");
        var request = new MockHttpServletRequest("GET", "/api/menu/products");
        request.addHeader("Authorization", "Bearer fake.token.value");
        var response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, new MockFilterChain());
        assertEquals(503, response.getStatus());
    }
}
