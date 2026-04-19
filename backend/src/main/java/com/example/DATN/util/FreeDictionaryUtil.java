package com.example.DATN.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.*;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Utility để tra từ từ Free Dictionary API (dictionaryapi.dev)
 * Hoàn toàn miễn phí, không cần API key
 */
public class FreeDictionaryUtil {
    private static final String API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

    public static Map<String, Object> lookupWord(String word) {
        if (word == null || word.trim().isEmpty()) {
            return null;
        }

        try {
            String url = API_BASE + "/" + word.trim().toLowerCase();
            System.err.println("[FreeDictionary] Looking up: " + url);

            URL urlObj = new URL(url);
            java.net.URLConnection conn = urlObj.openConnection();
            conn.setRequestProperty("User-Agent", USER_AGENT);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), "UTF-8")
            );

            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line);
            }
            reader.close();

            String response = content.toString().trim();
            if (response.isEmpty()) {
                System.err.println("[FreeDictionary] Empty response");
                return null;
            }

            // Parse JSON array - API returns array of entries
            JSONArray entries = new JSONArray(response);
            if (entries.length() == 0) {
                System.err.println("[FreeDictionary] No entries found");
                return null;
            }

            JSONObject entry = entries.getJSONObject(0);
            Map<String, Object> result = new HashMap<>();

            // Extract word and phonetic
            result.put("word", entry.optString("word", word));
            if (entry.has("phonetic")) {
                result.put("phonetic", entry.getString("phonetic"));
            }

            // Extract audio URLs from phonetics array
            JSONArray phoneticsArray = entry.optJSONArray("phonetics");
            if (phoneticsArray != null) {
                String usAudio = "";
                String ukAudio = "";
                for (int i = 0; i < phoneticsArray.length(); i++) {
                    JSONObject ph = phoneticsArray.getJSONObject(i);
                    String audio = ph.optString("audio", "");
                    if (!audio.isEmpty()) {
                        if (audio.contains("-us.mp3") && usAudio.isEmpty()) {
                            usAudio = audio;
                        } else if (audio.contains("-uk.mp3") && ukAudio.isEmpty()) {
                            ukAudio = audio;
                        } else if (usAudio.isEmpty()) {
                            usAudio = audio; // Fallback to first available
                        }
                    }
                }
                result.put("usAudio", usAudio);
                result.put("ukAudio", ukAudio.isEmpty() ? usAudio : ukAudio);
            }

            // Extract meanings - each definition becomes a separate meaning entry
            List<Map<String, Object>> meanings = new ArrayList<>();
            JSONArray meaningsArray = entry.optJSONArray("meanings");
            
            if (meaningsArray != null) {
                for (int i = 0; i < meaningsArray.length(); i++) {
                    JSONObject meaning = meaningsArray.getJSONObject(i);
                    String partOfSpeech = meaning.optString("partOfSpeech", "");
                    
                    // Get all definitions for this part of speech (each becomes separate meaning)
                    JSONArray defArray = meaning.optJSONArray("definitions");
                    if (defArray != null) {
                        for (int j = 0; j < defArray.length(); j++) {
                            JSONObject def = defArray.getJSONObject(j);
                            
                            Map<String, Object> m = new HashMap<>();
                            m.put("partOfSpeech", partOfSpeech);
                            m.put("definition", def.optString("definition", ""));
                            m.put("example", def.optString("example", ""));
                            
                            meanings.add(m);
                        }
                    }
                }
            }

            result.put("meanings", meanings);

            System.err.println("[FreeDictionary] Found " + meanings.size() + " meanings");
            return result;

        } catch (Exception e) {
            System.err.println("[FreeDictionary] Error: " + e.getMessage());
            return null;
        }
    }
}
