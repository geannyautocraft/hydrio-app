package com.hydrio.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HydrioWidgetPlugin.class);
        registerPlugin(HydrioExportPlugin.class);
        registerPlugin(HydrioHealthPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
