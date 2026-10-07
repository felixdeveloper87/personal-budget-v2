package com.example.budget.service;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

class WebPushCryptoTest {

    /** RFC 8291 Appendix A: fixed keys and salt must produce the published body byte for byte. */
    @Test
    void encryptionMatchesTheRfc8291TestVector() throws Exception {
        byte[] body = WebPushCrypto.encrypt(
                "When I grow up, I want to be a watermelon".getBytes(StandardCharsets.UTF_8),
                WebPushCrypto.b64Decode("BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4"),
                WebPushCrypto.b64Decode("BTBZMqHH6r4Tts7J_aSIgg"),
                WebPushCrypto.decodePrivateKey(WebPushCrypto.b64Decode("yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw")),
                WebPushCrypto.decodePublicKey(WebPushCrypto.b64Decode(
                        "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8")),
                WebPushCrypto.b64Decode("DGv6ra1nlYgDCS1FRnbzlw"));

        assertThat(WebPushCrypto.b64(body)).isEqualTo(
                "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN");
    }

    @Test
    void vapidTokenIsSignedByTheConfiguredKey() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(256);
        KeyPair pair = generator.generateKeyPair();
        byte[] publicKey = WebPushCrypto.encodePublicKey((ECPublicKey) pair.getPublic());
        byte[] d = ((ECPrivateKey) pair.getPrivate()).getS().toByteArray();
        byte[] privateKey = new byte[32];
        System.arraycopy(d, Math.max(0, d.length - 32), privateKey, Math.max(0, 32 - d.length), Math.min(32, d.length));

        String header = WebPushCrypto.vapidAuthorization(
                "https://fcm.googleapis.com", "mailto:ops@example.com", 1_900_000_000L, publicKey, privateKey);

        assertThat(header).startsWith("vapid t=").endsWith(", k=" + WebPushCrypto.b64(publicKey));
        String[] jwt = header.substring("vapid t=".length(), header.indexOf(", k=")).split(Pattern.quote("."));
        assertThat(new String(WebPushCrypto.b64Decode(jwt[1]), StandardCharsets.UTF_8))
                .isEqualTo("{\"aud\":\"https://fcm.googleapis.com\",\"exp\":1900000000,\"sub\":\"mailto:ops@example.com\"}");
        Signature verifier = Signature.getInstance("SHA256withECDSAinP1363Format");
        verifier.initVerify(WebPushCrypto.decodePublicKey(publicKey));
        verifier.update((jwt[0] + "." + jwt[1]).getBytes(StandardCharsets.US_ASCII));
        assertThat(verifier.verify(WebPushCrypto.b64Decode(jwt[2]))).isTrue();
    }

    @Test
    void onlyKnownPushServicesAreAccepted() {
        assertThat(PushNotificationService.isAllowedEndpoint("https://fcm.googleapis.com/fcm/send/abc")).isTrue();
        assertThat(PushNotificationService.isAllowedEndpoint("https://updates.push.services.mozilla.com/wpush/v2/x")).isTrue();
        assertThat(PushNotificationService.isAllowedEndpoint("https://web.push.apple.com/QGxx")).isTrue();
        assertThat(PushNotificationService.isAllowedEndpoint("https://wns2-db5p.notify.windows.com/w/?token=x")).isTrue();
        assertThat(PushNotificationService.isAllowedEndpoint("http://fcm.googleapis.com/fcm/send/abc")).isFalse();
        assertThat(PushNotificationService.isAllowedEndpoint("https://evilfcm.googleapis.com.attacker.io/x")).isFalse();
        assertThat(PushNotificationService.isAllowedEndpoint("https://169.254.169.254/latest")).isFalse();
        assertThat(PushNotificationService.isAllowedEndpoint("not a url")).isFalse();
    }
}
