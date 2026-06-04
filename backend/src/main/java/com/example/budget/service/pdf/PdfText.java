package com.example.budget.service.pdf;

import org.apache.pdfbox.pdmodel.font.PDFont;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Text rendering and measurement helpers: drawing, right-alignment, ellipsis fitting,
 * word wrapping, width measurement and character sanitisation for the PDF report.
 */
class PdfText {
    private final PdfRenderState state;

    PdfText(PdfRenderState state) {
        this.state = state;
    }

    void draw(String value, float x, float textY, PDFont font, float size) throws IOException {
        state.content.beginText();
        state.content.setFont(font, size);
        state.content.newLineAtOffset(x, textY);
        state.content.showText(safe(value));
        state.content.endText();
    }

    void drawRight(String value, float rightX, float textY, PDFont font, float size) throws IOException {
        String safe = safe(value);
        draw(safe, rightX - width(safe, font, size), textY, font, size);
    }

    void drawFitted(String value, float x, float textY, float maxWidth, PDFont font, float size)
            throws IOException {
        draw(fit(value, maxWidth, font, size), x, textY, font, size);
    }

    List<String> wrap(String value, float maxWidth, PDFont font, float size, int maxLines) throws IOException {
        String safe = safe(value).trim();
        if (safe.isEmpty()) {
            return List.of("");
        }

        String[] words = safe.split("\\s+");
        List<String> lines = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String word : words) {
            String candidate = current.length() == 0 ? word : current + " " + word;
            if (width(candidate, font, size) <= maxWidth) {
                current.setLength(0);
                current.append(candidate);
                continue;
            }

            if (current.length() == 0) {
                lines.add(fit(word, maxWidth, font, size));
            } else {
                lines.add(current.toString());
                current.setLength(0);
                current.append(word);
            }

            if (lines.size() == maxLines) {
                break;
            }
        }

        if (current.length() > 0 && lines.size() < maxLines) {
            lines.add(current.toString());
        }
        if (lines.isEmpty()) {
            lines.add("");
        }
        if (lines.size() == maxLines && words.length > 0) {
            int last = lines.size() - 1;
            lines.set(last, fit(lines.get(last), maxWidth, font, size));
        }
        return lines;
    }

    String fit(String value, float maxWidth, PDFont font, float size) throws IOException {
        String safe = safe(value);
        if (width(safe, font, size) <= maxWidth) {
            return safe;
        }
        String suffix = "...";
        while (!safe.isEmpty() && width(safe + suffix, font, size) > maxWidth) {
            safe = safe.substring(0, safe.length() - 1);
        }
        return safe.isBlank() ? suffix : safe.stripTrailing() + suffix;
    }

    float width(String value, PDFont font, float size) throws IOException {
        return font.getStringWidth(safe(value)) / 1000f * size;
    }

    String safe(String value) {
        String normalized = blankToDefault(value, "")
                .replace("\n", " ")
                .replace("\r", " ")
                .replace("–", "-")
                .replace("—", "-")
                .replace("‘", "'")
                .replace("’", "'")
                .replace("“", "\"")
                .replace("”", "\"");
        StringBuilder safe = new StringBuilder(normalized.length());
        for (int i = 0; i < normalized.length(); i++) {
            char ch = normalized.charAt(i);
            if (ch >= 32 && ch <= 255) {
                safe.append(ch);
            } else {
                safe.append("?");
            }
        }
        return safe.toString();
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
