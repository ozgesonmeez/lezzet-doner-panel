package com.lezzetdoner.backend.menu.image;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PublicMenuImageControllerTest {
    @Test
    void servesOriginalBytesAndContentType() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        PreparedStatement statement = mock(PreparedStatement.class);
        ResultSet rows = mock(ResultSet.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.prepareStatement(anyString())).thenReturn(statement);
        when(statement.executeQuery()).thenReturn(rows);
        when(rows.next()).thenReturn(true);
        byte[] original = {1, 2, 3};
        when(rows.getBytes("image_bytes")).thenReturn(original);
        when(rows.getString("content_type")).thenReturn("image/png");
        UUID id = UUID.randomUUID();

        var response = new PublicMenuImageController(dataSource).get(id);

        assertArrayEquals(original, response.getBody());
        assertEquals(MediaType.IMAGE_PNG, response.getHeaders().getContentType());
        assertEquals(original.length, response.getHeaders().getContentLength());
        assertEquals("nosniff", response.getHeaders().getFirst("X-Content-Type-Options"));
        verify(statement).setObject(1, id);
    }

    @Test
    void missingLegacyImageReturnsNotFound() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        PreparedStatement statement = mock(PreparedStatement.class);
        ResultSet rows = mock(ResultSet.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.prepareStatement(anyString())).thenReturn(statement);
        when(statement.executeQuery()).thenReturn(rows);
        when(rows.next()).thenReturn(false);

        var error = assertThrows(ResponseStatusException.class,
                () -> new PublicMenuImageController(dataSource).get(UUID.randomUUID()));

        assertEquals(404, error.getStatusCode().value());
    }
}
