package com.lezzetdoner.backend.menu.image;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;

class MenuImageServiceTest {
    private final MenuImageService service = new MenuImageService(new Cloudinary(Map.of(
            "cloud_name", "", "api_key", "", "api_secret", ""
    )));

    @Test
    void uploadsOriginalBytesToCloudinaryWithoutOverwriting() throws Exception {
        Cloudinary cloudinary = spy(new Cloudinary(Map.of(
                "cloud_name", "test-cloud", "api_key", "test-key", "api_secret", "test-secret"
        )));
        Uploader uploader = mock(Uploader.class);
        doReturn(uploader).when(cloudinary).uploader();
        byte[] original = {1, 2, 3};
        var file = new MockMultipartFile("file", "test.png", "image/png", original);
        when(uploader.upload(any(), anyMap())).thenReturn(Map.of(
                "secure_url", "https://res.cloudinary.com/test-cloud/image/upload/photo.png",
                "public_id", "lezzet-doner/menu/photo", "format", "png",
                "width", 2, "height", 3
        ));

        var response = new MenuImageService(cloudinary).upload(file);

        ArgumentCaptor<Object> bytes = ArgumentCaptor.forClass(Object.class);
        ArgumentCaptor<Map> options = ArgumentCaptor.forClass(Map.class);
        verify(uploader).upload(bytes.capture(), options.capture());
        assertArrayEquals(original, (byte[]) bytes.getValue());
        assertEquals("lezzet-doner/menu", options.getValue().get("folder"));
        assertEquals(false, options.getValue().get("overwrite"));
        assertEquals("https://res.cloudinary.com/test-cloud/image/upload/photo.png", response.url());
        assertEquals(2, response.width());
    }

    @Test
    void missingCredentialsFailWithoutDatabaseFallback() {
        var file = new MockMultipartFile("file", "test.png", "image/png", new byte[]{1});
        var error = assertThrows(ResponseStatusException.class, () -> service.upload(file));
        assertEquals(503, error.getStatusCode().value());
    }

    @Test
    void rejectsEmptyAndUnsupportedFiles() {
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.upload(null)).getStatusCode().value());
        var file = new MockMultipartFile("file", "test.svg", "image/svg+xml", new byte[]{1});
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.upload(file)).getStatusCode().value());
    }
}
