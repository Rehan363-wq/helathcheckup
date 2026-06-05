"use client";

import { useEffect } from "react";

export default function StorageMigration() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      const keysToMigrate: string[] = [];
      
      // Step 1: Find all keys starting with "clinihome-"
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("clinihome-")) {
          keysToMigrate.push(key);
        }
      }

      // Step 2: Migrate keys
      if (keysToMigrate.length > 0) {
        console.log(`Migrating ${keysToMigrate.length} local storage keys from CliniHome to CliniHome...`);
        
        keysToMigrate.forEach((key) => {
          const val = localStorage.getItem(key);
          if (val !== null) {
            const newKey = key.replace("clinihome-", "clinihome-");
            localStorage.setItem(newKey, val);
            localStorage.removeItem(key);
          }
        });
        
        console.log("Migration complete!");
        
        // Trigger a custom event in case components are already listening
        window.dispatchEvent(new Event("local-session-change"));
      }
    } catch (error) {
      console.error("Failed to migrate local storage branding:", error);
    }
  }, []);

  return null;
}
