package com.hydrio.app;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

@CapacitorPlugin(name = "HydrioWidget")
public class HydrioWidgetPlugin extends Plugin {
    @PluginMethod
    public void syncState(PluginCall call) {
        String date = call.getString("date", HydrioWidgetStorage.todayKey());
        int totalMl = call.getInt("totalMl", 0);
        int goalMl = call.getInt("goalMl", 2000);

        HydrioWidgetStorage.syncState(getContext(), date, totalMl, goalMl);
        HydrioWidgetProvider.updateAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void getPendingEntries(PluginCall call) {
        JSONArray entries = HydrioWidgetStorage.getPendingEntries(getContext());
        JSObject result = new JSObject();
        result.put("entries", JSArray.from(entries));
        call.resolve(result);
    }

    @PluginMethod
    public void clearPendingEntries(PluginCall call) {
        HydrioWidgetStorage.clearPendingEntries(getContext());
        call.resolve();
    }
}
