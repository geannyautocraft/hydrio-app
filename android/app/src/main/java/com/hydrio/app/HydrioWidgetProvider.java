package com.hydrio.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.widget.RemoteViews;

public class HydrioWidgetProvider extends AppWidgetProvider {
    private static final int[] QUICK_AMOUNTS = {100, 250, 500};
    private static final Class<?>[] PROVIDER_CLASSES = {
        HydrioWidgetProvider.class,
        HydrioWidgetCompactProvider.class,
        HydrioWidgetMiniProvider.class
    };

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (HydrioWidgetStorage.ACTION_ADD_WATER.equals(intent.getAction())) {
            int amountMl = intent.getIntExtra(HydrioWidgetStorage.EXTRA_AMOUNT_ML, 0);
            HydrioWidgetStorage.addWater(context, amountMl);
            updateAll(context);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId, getLayoutResource());
        }
    }

    static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        for (Class<?> providerClass : PROVIDER_CLASSES) {
            ComponentName componentName = new ComponentName(context, providerClass);
            int[] widgetIds = manager.getAppWidgetIds(componentName);
            int layoutResource = layoutForProvider(providerClass);
            for (int widgetId : widgetIds) {
                updateWidget(context, manager, widgetId, layoutResource);
            }
        }
    }

    protected int getLayoutResource() {
        return R.layout.hydrio_widget;
    }

    private static int layoutForProvider(Class<?> providerClass) {
        if (providerClass == HydrioWidgetCompactProvider.class) {
            return R.layout.hydrio_widget_compact;
        }
        if (providerClass == HydrioWidgetMiniProvider.class) {
            return R.layout.hydrio_widget_mini;
        }
        return R.layout.hydrio_widget;
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId, int layoutResource) {
        int totalMl = HydrioWidgetStorage.getTotalMl(context);
        int goalMl = HydrioWidgetStorage.getGoalMl(context);
        int percentage = Math.min(100, Math.round((totalMl * 100f) / goalMl));
        int remainingMl = Math.max(0, goalMl - totalMl);

        RemoteViews views = new RemoteViews(context.getPackageName(), layoutResource);
        views.setTextViewText(R.id.widget_total, totalMl + " ml");
        views.setTextViewText(R.id.widget_goal, "de " + goalMl + " ml");
        views.setTextViewText(R.id.widget_percent, percentage + "%");
        views.setTextViewText(R.id.widget_remaining, buildStatusMessage(percentage, remainingMl));
        views.setProgressBar(R.id.widget_progress, 100, percentage, false);

        views.setOnClickPendingIntent(R.id.widget_root, openAppIntent(context));
        views.setOnClickPendingIntent(R.id.widget_add_100, addWaterIntent(context, QUICK_AMOUNTS[0]));
        views.setOnClickPendingIntent(R.id.widget_add_250, addWaterIntent(context, QUICK_AMOUNTS[1]));
        views.setOnClickPendingIntent(R.id.widget_add_500, addWaterIntent(context, QUICK_AMOUNTS[2]));

        manager.updateAppWidget(widgetId, views);
    }

    private static String buildStatusMessage(int percentage, int remainingMl) {
        java.util.Calendar now = java.util.Calendar.getInstance();
        int hour = now.get(java.util.Calendar.HOUR_OF_DAY);

        if (percentage >= 100) {
            return "Meta batida. Otimo trabalho!";
        }
        if (hour < 7) {
            return "Descanso agora. A gente continua ao acordar.";
        }
        if (hour < 10) {
            return "Bom dia. Comece com " + Math.min(remainingMl, 250) + " ml.";
        }
        if (hour >= 22) {
            return "Noite chegando. Faltam " + remainingMl + " ml.";
        }
        if (remainingMl <= 250) {
            return "Quase la. So faltam " + remainingMl + " ml.";
        }
        if (percentage < 35 && hour >= 12) {
            return "Hora de recuperar o ritmo: +" + Math.min(remainingMl, 500) + " ml.";
        }
        return "Faltam " + remainingMl + " ml para a meta.";
    }

    private static PendingIntent openAppIntent(Context context) {
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | immutableFlag();
        return PendingIntent.getActivity(context, 0, intent, flags);
    }

    private static PendingIntent addWaterIntent(Context context, int amountMl) {
        Intent intent = new Intent(context, HydrioWidgetProvider.class);
        intent.setAction(HydrioWidgetStorage.ACTION_ADD_WATER);
        intent.putExtra(HydrioWidgetStorage.EXTRA_AMOUNT_ML, amountMl);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | immutableFlag();
        return PendingIntent.getBroadcast(context, amountMl, intent, flags);
    }

    private static int immutableFlag() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0;
    }
}
