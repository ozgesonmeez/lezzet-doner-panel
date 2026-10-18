package com.lezzetdoner.backend.menu.image;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
public class MenuImageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Cloudinary cloudinary;

    public MenuImageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public MenuImageResponse upload(MultipartFile file) {
        validate(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "lezzet-doner/menu",
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true,
                            "overwrite", false
                    )
            );

            return new MenuImageResponse(
                    stringValue(result.get("secure_url")),
                    stringValue(result.get("public_id")),
                    stringValue(result.get("format")),
                    integerValue(result.get("width")),
                    integerValue(result.get("height"))
            );

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Görsel Cloudinary'ye yüklenemedi.",
                    exception
            );
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lütfen bir görsel seçin."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Görsel en fazla 10 MB olabilir."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sadece JPG, PNG veya WebP görseller yüklenebilir."
            );
        }
    }

    private String stringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private Integer integerValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }

        return null;
    }
}
