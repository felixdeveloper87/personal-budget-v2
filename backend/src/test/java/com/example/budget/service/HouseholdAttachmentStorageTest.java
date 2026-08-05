package com.example.budget.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HouseholdAttachmentStorageTest {
    @TempDir
    Path directory;

    @Test
    void storesAValidImageUnderTheHouseholdDirectory() {
        HouseholdAttachmentStorage storage =
                new HouseholdAttachmentStorage(directory.toString(), 5 * 1024 * 1024);
        MockMultipartFile image = new MockMultipartFile(
                "files",
                "receipt.jpg",
                "image/jpeg",
                new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01});

        HouseholdAttachmentStorage.StoredFile stored = storage.store(42L, image);

        assertThat(stored.storageKey()).startsWith("42/").endsWith(".jpg");
        assertThat(stored.originalFilename()).isEqualTo("receipt.jpg");
        assertThat(Files.isRegularFile(directory.resolve(stored.storageKey()))).isTrue();
    }

    @Test
    void rejectsAFileWhoseBytesDoNotMatchItsDeclaredType() {
        HouseholdAttachmentStorage storage =
                new HouseholdAttachmentStorage(directory.toString(), 5 * 1024 * 1024);
        MockMultipartFile disguised = new MockMultipartFile(
                "files",
                "not-really-a-photo.jpg",
                "image/jpeg",
                new byte[] {0x01, 0x02, 0x03, 0x04});

        assertThatThrownBy(() -> storage.store(42L, disguised))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("The selected file is not a valid image");
    }

    @Test
    void rejectsAnImageLargerThanTheConfiguredLimit() {
        HouseholdAttachmentStorage storage =
                new HouseholdAttachmentStorage(directory.toString(), 3);
        MockMultipartFile image = new MockMultipartFile(
                "files",
                "large.jpg",
                "image/jpeg",
                new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01});

        assertThatThrownBy(() -> storage.store(42L, image))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Each image must be 5 MB or smaller");
    }
}
