import { supabase } from "@/integrations/supabase/client";

/**
 * VaultService handles secure access to legislative documents
 * by requesting signed URLs from the backend Edge Function.
 */
class VaultService {
  private urlCache: Map<string, { url: string; expires: number }> = new Map();

  /**
   * Get a secure, signed URL for a vault document
   * @param filePath The path in the Backblaze B2 bucket
   */
  async getSignedUrl(filePath: string): Promise<string | null> {
    try {
      // 1. Check cache (1-hour expiry matching Edge Function)
      const cached = this.urlCache.get(filePath);
      if (cached && cached.expires > Date.now()) {
        return cached.url;
      }

      // 2. Request from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('vault-auth', {
        body: { file_path: filePath }
      });

      if (error) throw error;

      const signedUrl = data.signedUrl;
      
      // 3. Update cache (expire 5 mins early for safety)
      this.urlCache.set(filePath, {
        url: signedUrl,
        expires: Date.now() + 3300 * 1000 
      });

      return signedUrl;
    } catch (err) {
      console.error("Vault access error:", err);
      return null;
    }
  }

  /**
   * Opens the vault document in a new tab
   */
  async openDocument(filePath: string) {
    const url = await this.getSignedUrl(filePath);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}

export const vaultService = new VaultService();
export default vaultService;
