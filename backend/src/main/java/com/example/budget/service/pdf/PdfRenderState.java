package com.example.budget.service.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

/**
 * Shared, mutable rendering state for the PDF report plus the fixed A4 page geometry.
 * Passed to every drawing collaborator so they operate on the same document, content
 * stream and vertical cursor ({@code y}). This mirrors the state that previously lived as
 * fields on the {@code PdfReportWriter} inner classes.
 */
class PdfRenderState {
    static final float MARGIN = 42;
    static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    static final float CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    static final float FOOTER_Y = 30;
    static final float FOOTER_SAFE_TOP = 66;

    PDDocument document;
    PDPageContentStream content;
    float y;
    int pageNumber;
}
