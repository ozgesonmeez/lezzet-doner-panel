package com.lezzetdoner.backend.menu.image;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/public/menu/images")
public class PublicMenuImageController {
    private final DataSource dataSource;

    public PublicMenuImageController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> get(@PathVariable UUID id) {
        try (Connection c = dataSource.getConnection();
             PreparedStatement statement = c.prepareStatement(
                     "SELECT content_type, image_bytes FROM menu_uploaded_images WHERE id = ?")) {
            statement.setObject(1, id);
            try (ResultSet rs = statement.executeQuery()) {
                if (!rs.next()) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gorsel bulunamadi.");
                }
                byte[] data = rs.getBytes("image_bytes");
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(rs.getString("content_type")))
                        .contentLength(data.length)
                        .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                        .header("X-Content-Type-Options", "nosniff")
                        .body(data);
            }
        } catch (SQLException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Gorsel getirilemedi.", exception);
        }
    }
}
