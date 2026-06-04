package com.example.budget.service.pdf;

import java.io.IOException;

/**
 * Colour palette and primitive fill/stroke/line operations for the PDF report.
 */
class PdfTheme {
    private final PdfRenderState state;

    PdfTheme(PdfRenderState state) {
        this.state = state;
    }

    int[] primary() {
        return new int[] { 37, 99, 235 };
    }

    int[] success() {
        return new int[] { 22, 163, 74 };
    }

    int[] danger() {
        return new int[] { 220, 38, 38 };
    }

    int[] purple() {
        return new int[] { 124, 58, 237 };
    }

    int[] headingColor() {
        return new int[] { 15, 23, 42 };
    }

    int[] bodyColor() {
        return new int[] { 51, 65, 85 };
    }

    int[] mutedColor() {
        return new int[] { 100, 116, 139 };
    }

    int[] border() {
        return new int[] { 226, 232, 240 };
    }

    int[] subtleBorder() {
        return new int[] { 241, 245, 249 };
    }

    int[] offWhite() {
        return new int[] { 248, 250, 252 };
    }

    int[] white() {
        return new int[] { 255, 255, 255 };
    }

    int[] zebra() {
        return new int[] { 250, 252, 255 };
    }

    int[] progressTrack() {
        return new int[] { 241, 245, 249 };
    }

    void heading() throws IOException {
        color(headingColor());
    }

    void secondaryText() throws IOException {
        color(bodyColor());
    }

    void mutedText() throws IOException {
        color(mutedColor());
    }

    void primaryText() throws IOException {
        color(primary());
    }

    void whiteText() throws IOException {
        color(white());
    }

    void color(int[] rgb) throws IOException {
        state.content.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        state.content.setStrokingColor(rgb[0], rgb[1], rgb[2]);
    }

    void fill(float x, float rectY, float width, float height, int[] rgb) throws IOException {
        color(rgb);
        state.content.addRect(x, rectY, width, height);
        state.content.fill();
    }

    void stroke(float x, float rectY, float width, float height, int[] rgb) throws IOException {
        color(rgb);
        state.content.addRect(x, rectY, width, height);
        state.content.stroke();
    }

    void line(float x1, float y1, float x2, float y2, int[] rgb) throws IOException {
        color(rgb);
        state.content.moveTo(x1, y1);
        state.content.lineTo(x2, y2);
        state.content.stroke();
    }
}
