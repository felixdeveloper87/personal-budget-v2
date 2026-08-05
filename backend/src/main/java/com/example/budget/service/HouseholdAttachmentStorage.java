package com.example.budget.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class HouseholdAttachmentStorage {
    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private final Path root;
    private final long maxFileSize;

    public HouseholdAttachmentStorage(
            @Value("${app.household.attachments.directory}") String directory,
            @Value("${app.household.attachments.max-file-size-bytes:5242880}") long maxFileSize) {
        this.root = Path.of(directory).toAbsolutePath().normalize();
        this.maxFileSize = maxFileSize;
        try {
            Files.createDirectories(root);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not prepare Household attachment storage", ex);
        }
    }

    public StoredFile store(Long householdId, MultipartFile file) {
        validateBasic(file);
        String contentType = normalizedContentType(file.getContentType());
        String extension = extensionFor(contentType);
        String storageKey = householdId + "/" + UUID.randomUUID() + extension;
        Path target = resolve(storageKey);
        Path temporary = null;

        try {
            Files.createDirectories(target.getParent());
            temporary = Files.createTempFile(target.getParent(), ".upload-", ".tmp");
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, temporary, StandardCopyOption.REPLACE_EXISTING);
            }
            validateSignature(temporary, contentType);
            try {
                Files.move(temporary, target, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException ex) {
                Files.move(temporary, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredFile(
                    storageKey,
                    safeFilename(file.getOriginalFilename()),
                    contentType,
                    Files.size(target));
        } catch (IOException ex) {
            deleteQuietly(temporary);
            deleteQuietly(target);
            throw new IllegalStateException("Could not store the Household image", ex);
        } catch (RuntimeException ex) {
            deleteQuietly(temporary);
            deleteQuietly(target);
            throw ex;
        }
    }

    public Path load(String storageKey) {
        Path file = resolve(storageKey);
        if (!Files.isRegularFile(file)) {
            throw new IllegalArgumentException("This Household image is no longer available");
        }
        return file;
    }

    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(resolve(storageKey));
        } catch (IOException ex) {
            throw new IllegalStateException("Could not delete the Household image", ex);
        }
    }

    private void validateBasic(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Choose at least one image");
        }
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("Each image must be 5 MB or smaller");
        }
        normalizedContentType(file.getContentType());
    }

    private String normalizedContentType(String value) {
        String normalized = value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
        if (!ALLOWED_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are supported");
        }
        return normalized;
    }

    private void validateSignature(Path file, String contentType) throws IOException {
        byte[] header = new byte[12];
        int length;
        try (InputStream input = Files.newInputStream(file)) {
            length = input.read(header);
        }
        boolean valid = switch (contentType) {
            case "image/jpeg" ->
                    length >= 3
                            && unsigned(header[0]) == 0xFF
                            && unsigned(header[1]) == 0xD8
                            && unsigned(header[2]) == 0xFF;
            case "image/png" ->
                    length >= 8
                            && unsigned(header[0]) == 0x89
                            && header[1] == 'P'
                            && header[2] == 'N'
                            && header[3] == 'G'
                            && unsigned(header[4]) == 0x0D
                            && unsigned(header[5]) == 0x0A
                            && unsigned(header[6]) == 0x1A
                            && unsigned(header[7]) == 0x0A;
            case "image/webp" ->
                    length >= 12
                            && header[0] == 'R'
                            && header[1] == 'I'
                            && header[2] == 'F'
                            && header[3] == 'F'
                            && header[8] == 'W'
                            && header[9] == 'E'
                            && header[10] == 'B'
                            && header[11] == 'P';
            default -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException("The selected file is not a valid image");
        }
    }

    private Path resolve(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException("Invalid Household image");
        }
        Path resolved = root.resolve(storageKey).normalize();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("Invalid Household image");
        }
        return resolved;
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException("Unsupported image format");
        };
    }

    private String safeFilename(String originalFilename) {
        String value = originalFilename == null ? "household-image" : originalFilename;
        String normalized = value.replace('\\', '/');
        String leaf = normalized.substring(normalized.lastIndexOf('/') + 1)
                .replaceAll("[\\p{Cntrl}]", "")
                .trim();
        if (leaf.isBlank()) {
            return "household-image";
        }
        return leaf.length() > 255 ? leaf.substring(leaf.length() - 255) : leaf;
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private void deleteQuietly(Path path) {
        if (path == null) return;
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // The scheduled cleanup will remove any orphaned file if needed.
        }
    }

    public record StoredFile(
            String storageKey,
            String originalFilename,
            String contentType,
            long sizeBytes) {}
}
