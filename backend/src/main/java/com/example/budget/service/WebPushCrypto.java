package com.example.budget.service;

import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.AlgorithmParameters;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPrivateKeySpec;
import java.security.spec.ECPublicKeySpec;
import java.util.Arrays;
import java.util.Base64;

/**
 * Web Push message encryption (RFC 8291, aes128gcm per RFC 8188) and VAPID
 * signing (RFC 8292), using only the JDK's P-256, HMAC and AES-GCM.
 */
public final class WebPushCrypto {
    private static final int RECORD_SIZE = 4096;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final ECParameterSpec P256 = p256();

    private WebPushCrypto() {}

    /** Encrypts with a fresh sender key and salt. */
    public static byte[] encrypt(byte[] plaintext, byte[] userAgentPublic, byte[] authSecret)
            throws GeneralSecurityException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp256r1"), RANDOM);
        KeyPair senderKeys = generator.generateKeyPair();
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        return encrypt(
                plaintext,
                userAgentPublic,
                authSecret,
                (ECPrivateKey) senderKeys.getPrivate(),
                (ECPublicKey) senderKeys.getPublic(),
                salt);
    }

    /** Deterministic variant, exposed for the RFC 8291 test vector. */
    static byte[] encrypt(
            byte[] plaintext,
            byte[] userAgentPublic,
            byte[] authSecret,
            ECPrivateKey senderPrivate,
            ECPublicKey senderPublic,
            byte[] salt) throws GeneralSecurityException {
        byte[] senderPublicBytes = encodePublicKey(senderPublic);

        KeyAgreement agreement = KeyAgreement.getInstance("ECDH");
        agreement.init(senderPrivate);
        agreement.doPhase(decodePublicKey(userAgentPublic), true);
        byte[] ecdhSecret = agreement.generateSecret();

        byte[] keyInfo = concat(
                "WebPush: info\0".getBytes(StandardCharsets.US_ASCII),
                userAgentPublic,
                senderPublicBytes);
        byte[] ikm = hkdf(authSecret, ecdhSecret, keyInfo, 32);
        byte[] contentKey = hkdf(salt, ikm, "Content-Encoding: aes128gcm\0".getBytes(StandardCharsets.US_ASCII), 16);
        byte[] nonce = hkdf(salt, ikm, "Content-Encoding: nonce\0".getBytes(StandardCharsets.US_ASCII), 12);

        // A single record: the payload followed by the 0x02 last-record delimiter.
        byte[] padded = Arrays.copyOf(plaintext, plaintext.length + 1);
        padded[plaintext.length] = 0x02;
        if (padded.length + 16 > RECORD_SIZE) {
            throw new IllegalArgumentException("Push payload is too large");
        }

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(contentKey, "AES"), new GCMParameterSpec(128, nonce));
        byte[] ciphertext = cipher.doFinal(padded);

        ByteBuffer header = ByteBuffer.allocate(16 + 4 + 1 + senderPublicBytes.length);
        header.put(salt).putInt(RECORD_SIZE).put((byte) senderPublicBytes.length).put(senderPublicBytes);
        return concat(header.array(), ciphertext);
    }

    /** Builds the VAPID {@code Authorization} header value for one push service origin. */
    public static String vapidAuthorization(
            String audience,
            String subject,
            long expiresAtEpochSeconds,
            byte[] vapidPublic,
            byte[] vapidPrivate) throws GeneralSecurityException {
        String header = b64("{\"typ\":\"JWT\",\"alg\":\"ES256\"}".getBytes(StandardCharsets.UTF_8));
        String claims = b64(("{\"aud\":\"" + jsonEscape(audience)
                + "\",\"exp\":" + expiresAtEpochSeconds
                + ",\"sub\":\"" + jsonEscape(subject) + "\"}").getBytes(StandardCharsets.UTF_8));
        String signingInput = header + "." + claims;

        Signature signer = Signature.getInstance("SHA256withECDSAinP1363Format");
        signer.initSign(decodePrivateKey(vapidPrivate));
        signer.update(signingInput.getBytes(StandardCharsets.US_ASCII));
        String jwt = signingInput + "." + b64(signer.sign());
        return "vapid t=" + jwt + ", k=" + b64(vapidPublic);
    }

    public static ECPublicKey decodePublicKey(byte[] uncompressed) throws GeneralSecurityException {
        if (uncompressed.length != 65 || uncompressed[0] != 0x04) {
            throw new GeneralSecurityException("Expected an uncompressed P-256 public key");
        }
        BigInteger x = new BigInteger(1, Arrays.copyOfRange(uncompressed, 1, 33));
        BigInteger y = new BigInteger(1, Arrays.copyOfRange(uncompressed, 33, 65));
        return (ECPublicKey) KeyFactory.getInstance("EC")
                .generatePublic(new ECPublicKeySpec(new ECPoint(x, y), P256));
    }

    public static ECPrivateKey decodePrivateKey(byte[] raw) throws GeneralSecurityException {
        if (raw.length != 32) {
            throw new GeneralSecurityException("Expected a 32-byte P-256 private key");
        }
        return (ECPrivateKey) KeyFactory.getInstance("EC")
                .generatePrivate(new ECPrivateKeySpec(new BigInteger(1, raw), P256));
    }

    public static byte[] encodePublicKey(ECPublicKey key) {
        return concat(new byte[] {0x04}, unsigned32(key.getW().getAffineX()), unsigned32(key.getW().getAffineY()));
    }

    public static byte[] b64Decode(String value) {
        return Base64.getUrlDecoder().decode(value.trim().replace('+', '-').replace('/', '_').replace("=", ""));
    }

    static String b64(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    /** HKDF-SHA256 with a single expand block, which covers every length used here. */
    private static byte[] hkdf(byte[] salt, byte[] ikm, byte[] info, int length) throws GeneralSecurityException {
        byte[] prk = hmac(salt, ikm);
        return Arrays.copyOf(hmac(prk, concat(info, new byte[] {0x01})), length);
    }

    private static byte[] hmac(byte[] key, byte[] data) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(data);
    }

    private static byte[] unsigned32(BigInteger value) {
        byte[] bytes = value.toByteArray();
        if (bytes.length == 32) return bytes;
        byte[] out = new byte[32];
        int copy = Math.min(bytes.length, 32);
        System.arraycopy(bytes, bytes.length - copy, out, 32 - copy, copy);
        return out;
    }

    private static byte[] concat(byte[]... parts) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        for (byte[] part : parts) out.writeBytes(part);
        return out.toByteArray();
    }

    private static String jsonEscape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static ECParameterSpec p256() {
        try {
            AlgorithmParameters parameters = AlgorithmParameters.getInstance("EC");
            parameters.init(new ECGenParameterSpec("secp256r1"));
            return parameters.getParameterSpec(ECParameterSpec.class);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("P-256 is not available", exception);
        }
    }
}
