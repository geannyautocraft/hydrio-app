package com.hydrio.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

final class HydrioWidgetStorage {
    static final String ACTION_ADD_WATER = "com.hydrio.app.widget.ADD_WATER";
    static final String EXTRA_AMOUNT_ML = "amountMl";

    private static final String PREFS_NAME = "hydrio_widget";
    private static final String KEY_DATE = "date";
    private static final String KEY_TOTAL_ML = "totalMl";
    private static final String KEY_GOAL_ML = "goalMl";
    private static final String KEY_PENDING_ENTRIES = "pendingEntries";
    private static final int DEFAULT_GOAL_ML = 2000;

    private HydrioWidgetStorage() {}

    static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    static String todayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    static int getTotalMl(Context context) {
        ensureToday(context);
        return prefs(context).getInt(KEY_TOTAL_ML, 0);
    }

    static int getGoalMl(Context context) {
        return Math.max(1, prefs(context).getInt(KEY_GOAL_ML, DEFAULT_GOAL_ML));
    }

    static void syncState(Context context, String date, int totalMl, int goalMl) {
        prefs(context)
                .edit()
                .putString(KEY_DATE, date)
                .putInt(KEY_TOTAL_ML, Math.max(0, totalMl))
                .putInt(KEY_GOAL_ML, Math.max(1, goalMl))
                .apply();
    }

    static void addWater(Context context, int amountMl) {
        if (amountMl <= 0) return;
        ensureToday(context);

        SharedPreferences sharedPreferences = prefs(context);
        int totalMl = sharedPreferences.getInt(KEY_TOTAL_ML, 0);
        JSONArray pendingEntries = getPendingEntries(context);
        JSONObject entry = new JSONObject();

        try {
            entry.put("amount", amountMl);
            entry.put("timestamp", isoNow());
            pendingEntries.put(entry);
        } catch (JSONException ignored) {
            return;
        }

        sharedPreferences
                .edit()
                .putInt(KEY_TOTAL_ML, totalMl + amountMl)
                .putString(KEY_PENDING_ENTRIES, pendingEntries.toString())
                .apply();
    }

    static JSONArray getPendingEntries(Context context) {
        String rawEntries = prefs(context).getString(KEY_PENDING_ENTRIES, "[]");
        try {
            return new JSONArray(rawEntries);
        } catch (JSONException ignored) {
            return new JSONArray();
        }
    }

    static void clearPendingEntries(Context context) {
        prefs(context).edit().putString(KEY_PENDING_ENTRIES, "[]").apply();
    }

    private static void ensureToday(Context context) {
        SharedPreferences sharedPreferences = prefs(context);
        String today = todayKey();
        String storedDate = sharedPreferences.getString(KEY_DATE, today);
        if (!today.equals(storedDate)) {
            sharedPreferences
                    .edit()
                    .putString(KEY_DATE, today)
                    .putInt(KEY_TOTAL_ML, 0)
                    .apply();
        }
    }

    private static String isoNow() {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.US).format(new Date());
    }
}
