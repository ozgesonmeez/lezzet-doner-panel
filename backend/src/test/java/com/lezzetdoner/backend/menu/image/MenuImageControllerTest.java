package com.lezzetdoner.backend.menu.image;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MenuImageControllerTest {
    private final MenuImageService service = mock(MenuImageService.class);
    private final MenuImageController controller = new MenuImageController(service);
    private final MockMultipartFile file =
            new MockMultipartFile("file", "photo.png", "image/png", new byte[]{1});

    @Test
    void acceptsVerifiedRemotePanelAdministrator() {
        var admin = new UsernamePasswordAuthenticationToken("panel-verified-admin", null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        var response = new MenuImageResponse("https://res.cloudinary.com/test/photo.png",
                "lezzet-doner/menu/photo", "png", 1, 1);
        when(service.upload(file)).thenReturn(response);
        assertSame(response, controller.upload(file, admin));
    }

    @Test
    void acceptsLocallyAuthenticatedAdministrator() {
        var admin = new UsernamePasswordAuthenticationToken("local-admin", null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        controller.upload(file, admin);
        verify(service).upload(file);
    }

    @Test
    void deniesMissingSessionBeforeUpload() {
        var error = assertThrows(ResponseStatusException.class, () -> controller.upload(file, null));
        assertEquals(401, error.getStatusCode().value());
        verifyNoInteractions(service);
    }

    @Test
    void deniesCourierBeforeUpload() {
        var courier = new UsernamePasswordAuthenticationToken("courier", null,
                List.of(new SimpleGrantedAuthority("ROLE_PAKETCI")));
        var error = assertThrows(ResponseStatusException.class, () -> controller.upload(file, courier));
        assertEquals(403, error.getStatusCode().value());
        verifyNoInteractions(service);
    }
}
