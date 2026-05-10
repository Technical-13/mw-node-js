import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.Scanner;
import java.util.Properties;
import java.io.FileInputStream;

public class WikiEncryptor {
    public static void main(String[] args) {
        try {
            // 1. Load WIKI_ENCRYPTION_KEY from .env
            Properties env = new Properties();
            env.load(new FileInputStream(".env"));
            String hexKey = env.getProperty("WIKI_ENCRYPTION_KEY");

            if (hexKey == null || hexKey.length() != 64) {
                System.out.println("❌ Error: .env must contain a 64-character hex WIKI_ENCRYPTION_KEY");
                return;
            }

            // 2. Get Password from User
            Scanner scanner = new Scanner(System.in);
            System.out.print("Enter Wiki Password: ");
            String password = scanner.nextLine();

            // 3. Prepare Encryption
            byte[] keyBytes = hexToBytes(hexKey);
            byte[] ivBytes = new byte[16];
            new SecureRandom().nextBytes(ivBytes); 

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new IvParameterSpec(ivBytes));

            // 4. Encrypt
            byte[] encrypted = cipher.doFinal(password.getBytes("UTF-8"));

            // 5. Output formatted for wikiconfig.json
            System.out.println("\n--- Copy these to wikiconfig.json ---");
            System.out.println("encryptedPassword: \"" + bytesToHex(encrypted) + "\"");
            System.out.println("iv: \"" + bytesToHex(ivBytes) + "\"");

        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }

    private static byte[] hexToBytes(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4) + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
