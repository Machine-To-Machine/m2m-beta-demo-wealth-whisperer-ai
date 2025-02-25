import { VerifiableCredential } from "@web5/credentials";

const CREDENTIAL_EXPIRY = 300000; // 5 minutes in milliseconds

export const verifyToken = async (req, res, next) => {
  try {
    const { vcJwt, timestamp } = req.body;

    // Check if VC JWT is present
    if (!vcJwt) {
      return res.status(401).json({ message: "Access denied: Missing verification credentials" });
    }

    // Check timestamp for request freshness
    const now = new Date().getTime();
    if (timestamp && now - timestamp > CREDENTIAL_EXPIRY) {
      return res.status(401).json({ message: "Request expired" });
    }

    try {
      // Verify the JWT
      const vc = await VerifiableCredential.verify({vcJwt: vcJwt});

      // Check if verification succeeded and potentially validate claims
      if (!vc || !vc.credentialSubject) {
        return res.status(401).json({ message: "Access denied: Invalid credentials" });
      }

      // Store validated credential subject for use in route handlers
      req.verifiedCredential = vc.credentialSubject;
      next();
    } catch (verifyError) {
      console.error("Credential verification failed:", verifyError.message);
      return res.status(401).json({ message: "Access denied: Credential verification failed" });
    }
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(500).json({ message: "Authentication system error" });
  }
};
