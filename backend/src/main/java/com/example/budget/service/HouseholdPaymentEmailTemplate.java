package com.example.budget.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Currency;
import java.util.List;
import java.util.Locale;

/** Branded e-mails for Household payment reminders. */
@Component
public class HouseholdPaymentEmailTemplate {
    private final String publicUrl;

    public HouseholdPaymentEmailTemplate(
            @Value("${app.web.public-url:https://www.personalbudget.co.uk}") String publicUrl) {
        this.publicUrl = publicUrl.replaceAll("/+$", "");
    }

    public EmailContent paymentReminder(
            String recipientName,
            String householdName,
            List<Debt> debts,
            String currency) {
        String lines = debts.stream()
                .map(debt -> "- " + money(debt.amount(), currency) + " to " + debt.creditorName())
                .reduce("", (left, right) -> left.isEmpty() ? right : left + "\n" + right);
        BigDecimal total = debts.stream().map(Debt::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        String text = "Hello " + recipientName + ",\n\nYou still have outstanding Household payments in "
                + householdName + ":\n" + lines + "\n\nTotal: " + money(total, currency)
                + ". Open Personal Budget to register a payment.";
        String debtRows = debts.stream()
                .map(debt -> "<tr><td style=\"padding:8px 0;color:#52645a;\">"
                        + escape(debt.creditorName()) + "</td><td align=\"right\" style=\"padding:8px 0;font-weight:bold;color:#17684f;\">"
                        + escape(money(debt.amount(), currency)) + "</td></tr>")
                .reduce("", String::concat);
        String detail = "<p style=\"margin:0 0 10px;font-size:16px;line-height:1.65;color:#52645a;\">Hi "
                + escape(recipientName) + ", these Household payments are still outstanding.</p>"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">"
                + debtRows + "<tr><td style=\"padding-top:12px;border-top:1px solid #cfeddf;font-weight:bold;\">Total</td>"
                + "<td align=\"right\" style=\"padding-top:12px;border-top:1px solid #cfeddf;font-size:18px;font-weight:bold;color:#17684f;\">"
                + escape(money(total, currency)) + "</td></tr></table>";
        return new EmailContent(text, layout(
                "Payment reminder",
                "You have payments to settle",
                detail,
                "Household", householdName,
                "Register payment"));
    }

    private String layout(
            String eyebrow, String title, String content, String label, String value, String button) {
        return """
                <!doctype html><html lang="en"><body style="margin:0;background:#f5f7f6;font-family:Arial,sans-serif;color:#17251f;">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#f5f7f6;"><tr><td align="center">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(23,37,31,.08);">
                <tr><td style="height:6px;background:#34b58b;"></td></tr><tr><td style="padding:28px 32px 8px;"><img src="%s/branding.png" width="190" alt="Personal Budget" style="display:block;border:0;max-width:190px;height:auto;"></td></tr>
                <tr><td style="padding:28px 32px 12px;"><div style="color:#168461;font-size:12px;font-weight:bold;letter-spacing:1.3px;text-transform:uppercase;">%s</div><h1 style="margin:12px 0 16px;font-size:28px;line-height:1.2;">%s</h1>%s</td></tr>
                <tr><td style="padding:12px 32px 28px;"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#ecf8f3;border:1px solid #cfeddf;border-radius:12px;"><tr><td style="padding:16px 18px;"><div style="font-size:12px;font-weight:bold;color:#5b7467;text-transform:uppercase;letter-spacing:.8px;">%s</div><div style="margin-top:5px;font-size:18px;font-weight:bold;color:#17684f;">%s</div></td></tr></table></td></tr>
                <tr><td style="padding:0 32px 34px;"><a href="%s/household" style="display:inline-block;background:#168461;border-radius:9px;padding:13px 20px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;">%s</a></td></tr></table>
                <p style="margin:20px 0 0;color:#77867e;font-size:12px;">Personal Budget · Clarity for your money</p></td></tr></table></body></html>
                """.formatted(publicUrl, escape(eyebrow), escape(title), content,
                escape(label), escape(value), publicUrl, escape(button));
    }

    private String money(BigDecimal amount, String currency) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.UK);
        formatter.setCurrency(Currency.getInstance(currency));
        return formatter.format(amount);
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    public record Debt(String creditorName, BigDecimal amount) {}
    public record EmailContent(String text, String html) {}
}
