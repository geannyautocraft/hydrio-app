package com.hydrio.app;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "HydrioExport")
public class HydrioExportPlugin extends Plugin {
    private static final String EXPORT_FOLDER = "Hydrio";

    @PluginMethod
    public void saveFile(PluginCall call) {
        String filename = call.getString("filename");
        String content = call.getString("content");
        String mimeType = call.getString("mimeType", "application/octet-stream");

        if (filename == null || filename.trim().isEmpty()) {
            call.reject("Missing filename");
            return;
        }

        if (content == null) {
            call.reject("Missing content");
            return;
        }

        try {
            Uri uri = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? saveWithMediaStore(filename, content, mimeType)
                : saveLegacy(filename, content);

            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            result.put("path", "Downloads/" + EXPORT_FOLDER + "/" + filename);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Could not save export file", error);
        }
    }

    private Uri saveWithMediaStore(String filename, String content, String mimeType) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
        values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
        values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + EXPORT_FOLDER);
        values.put(MediaStore.MediaColumns.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new IllegalStateException("Could not create download entry");
        }

        try (OutputStream stream = resolver.openOutputStream(uri)) {
            if (stream == null) {
                throw new IllegalStateException("Could not open download stream");
            }
            stream.write(content.getBytes(StandardCharsets.UTF_8));
        }

        values.clear();
        values.put(MediaStore.MediaColumns.IS_PENDING, 0);
        resolver.update(uri, values, null, null);
        return uri;
    }

    private Uri saveLegacy(String filename, String content) throws Exception {
        File downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File folder = new File(downloads, EXPORT_FOLDER);
        if (!folder.exists() && !folder.mkdirs()) {
            throw new IllegalStateException("Could not create export folder");
        }

        File file = new File(folder, filename);
        try (FileOutputStream stream = new FileOutputStream(file)) {
            stream.write(content.getBytes(StandardCharsets.UTF_8));
        }
        return Uri.fromFile(file);
    }
}
