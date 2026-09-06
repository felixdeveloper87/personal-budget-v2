package com.example.budget.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Responsive, email-client-safe presentation for scheduled cleaning reminders. */
@Component
public class HouseholdCleaningEmailTemplate {
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("EEEE d MMMM", Locale.UK);
    private final String publicUrl;

    public HouseholdCleaningEmailTemplate(
            @Value("${app.web.public-url:https://www.personalbudget.co.uk}") String publicUrl) {
        this.publicUrl = publicUrl.replaceAll("/+$", "");
    }

    public EmailContent assigned(String name, String household, LocalDate weekStart) {
        String period = DATE_FORMATTER.format(weekStart) + " – "
                + DATE_FORMATTER.format(weekStart.plusDays(6));
        String text = "Hello " + name + ",\n\nYou are responsible for the cleaning in "
                + household + " this week (" + period + ").\nOpen Personal Budget to see the checklist.";
        return new EmailContent(text, layout(
                "Weekly cleaning",
                "Your cleaning week starts now",
                "Hi " + escape(name) + ", you are responsible for the cleaning in <strong>"
                        + escape(household) + "</strong> this week.",
                "This week", period, "Open checklist"));
    }

    public EmailContent incomplete(String name, String household, long completed, int total) {
        long remaining = Math.max(0, total - completed);
        String text = "Hello " + name + ",\n\nYour cleaning week for " + household
                + " ends today. You have completed " + completed + " of " + total
                + " tasks. Please complete the remaining checklist items.";
        String title = remaining == 1 ? "One task still needs you" : remaining + " tasks still need you";
        return new EmailContent(text, layout(
                "Cleaning reminder", title,
                "Hi " + escape(name) + ", your cleaning week for <strong>"
                        + escape(household) + "</strong> ends today.",
                "Checklist progress", completed + " of " + total + " complete", "Complete checklist"));
    }

    private String layout(String eyebrow, String title, String intro, String label, String value, String button) {
        return """
                <!doctype html><html lang="en"><body style="margin:0;background:#f5f7f6;font-family:Arial,sans-serif;color:#17251f;">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#f5f7f6;"><tr><td align="center">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(23,37,31,.08);">
                <tr><td style="height:6px;background:#34b58b;"></td></tr><tr><td style="padding:28px 32px 8px;"><img src="%s/branding.png" width="190" alt="Personal Budget" style="display:block;border:0;max-width:190px;height:auto;"></td></tr>
                <tr><td style="padding:28px 32px 12px;"><div style="color:#168461;font-size:12px;font-weight:bold;letter-spacing:1.3px;text-transform:uppercase;">%s</div><h1 style="margin:12px 0 16px;font-size:28px;line-height:1.2;">%s</h1><p style="margin:0;font-size:16px;line-height:1.65;color:#52645a;">%s</p></td></tr>
                <tr><td style="padding:12px 32px 28px;"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#ecf8f3;border:1px solid #cfeddf;border-radius:12px;"><tr><td style="padding:16px 18px;"><div style="font-size:12px;font-weight:bold;color:#5b7467;text-transform:uppercase;letter-spacing:.8px;">%s</div><div style="margin-top:5px;font-size:18px;font-weight:bold;color:#17684f;">%s</div></td></tr></table></td></tr>
                <tr><td style="padding:0 32px 34px;"><a href="%s/household" style="display:inline-block;background:#168461;border-radius:9px;padding:13px 20px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;">%s</a></td></tr></table>
                <p style="margin:20px 0 0;color:#77867e;font-size:12px;">Personal Budget · Clarity for your money</p></td></tr></table></body></html>
                """.formatted(publicUrl, escape(eyebrow), escape(title), intro,
                escape(label), escape(value), publicUrl, escape(button));
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    public record EmailContent(String text, String html) {}
}
