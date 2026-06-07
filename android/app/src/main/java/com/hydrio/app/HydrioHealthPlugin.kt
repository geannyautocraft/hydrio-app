package com.hydrio.app

import android.content.Intent
import android.net.Uri
import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZoneId

@CapacitorPlugin(name = "HydrioHealth")
class HydrioHealthPlugin : Plugin() {
    private val scope = CoroutineScope(Dispatchers.Main)
    private var pendingPermissionCall: PluginCall? = null
    private lateinit var permissionLauncher: ActivityResultLauncher<Set<String>>

    private val permissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
    )

    override fun load() {
        permissionLauncher = activity.registerForActivityResult(
            PermissionController.createRequestPermissionResultContract()
        ) { granted ->
            pendingPermissionCall?.let { call ->
                JSObject().apply {
                    put("granted", granted.containsAll(permissions))
                    put("grantedCount", granted.intersect(permissions).size)
                    put("requiredCount", permissions.size)
                }.also(call::resolve)
            }
            pendingPermissionCall = null
        }
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        val status = HealthConnectClient.getSdkStatus(context)
        scope.launch {
            val granted = if (status == HealthConnectClient.SDK_AVAILABLE) {
                client().permissionController.getGrantedPermissions()
            } else {
                emptySet()
            }

            call.resolve(JSObject().apply {
                put("available", status == HealthConnectClient.SDK_AVAILABLE)
                put("requiresInstall", status == HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED)
                put("status", status)
                put("granted", granted.containsAll(permissions))
                put("grantedCount", granted.intersect(permissions).size)
                put("requiredCount", permissions.size)
            })
        }
    }

    @PluginMethod
    fun requestHealthPermissions(call: PluginCall) {
        val status = HealthConnectClient.getSdkStatus(context)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect is not available")
            return
        }

        pendingPermissionCall = call
        permissionLauncher.launch(permissions)
    }

    @PluginMethod
    fun openHealthConnect(call: PluginCall) {
        try {
            val status = HealthConnectClient.getSdkStatus(context)
            if (status == HealthConnectClient.SDK_AVAILABLE) {
                activity.startActivity(Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS))
            } else {
                openHealthConnectInstallPage()
            }
            call.resolve()
        } catch (error: Exception) {
            call.reject("Could not open Health Connect", error)
        }
    }

    @PluginMethod
    fun readToday(call: PluginCall) {
        val status = HealthConnectClient.getSdkStatus(context)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect is not available")
            return
        }

        scope.launch {
            try {
                val healthClient = client()
                val granted = healthClient.permissionController.getGrantedPermissions()
                if (!granted.containsAll(permissions)) {
                    call.reject("Health Connect permissions not granted")
                    return@launch
                }

                val zone = ZoneId.systemDefault()
                val start = LocalDate.now(zone).atStartOfDay(zone).toInstant()
                val end = java.time.Instant.now()
                val range = TimeRangeFilter.between(start, end)

                val aggregate = healthClient.aggregate(
                    AggregateRequest(
                        metrics = setOf(
                            StepsRecord.COUNT_TOTAL,
                            ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL,
                            TotalCaloriesBurnedRecord.ENERGY_TOTAL,
                            DistanceRecord.DISTANCE_TOTAL,
                        ),
                        timeRangeFilter = range,
                    )
                )

                val sessions = healthClient.readRecords(
                    ReadRecordsRequest(
                        recordType = ExerciseSessionRecord::class,
                        timeRangeFilter = range,
                    )
                ).records

                val sessionArray = JSArray()
                sessions.take(12).forEach { session ->
                    sessionArray.put(JSObject().apply {
                        put("title", session.title ?: exerciseTypeLabel(session.exerciseType))
                        put("exerciseType", session.exerciseType)
                        put("startTime", session.startTime.toString())
                        put("endTime", session.endTime.toString())
                        put("durationMinutes", java.time.Duration.between(session.startTime, session.endTime).toMinutes())
                    })
                }

                val activeCalories = aggregate[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories ?: 0.0
                val totalCalories = aggregate[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories ?: 0.0
                val extraWaterMl = calculateExtraWater(activeCalories)

                call.resolve(JSObject().apply {
                    put("date", LocalDate.now(zone).toString())
                    put("steps", aggregate[StepsRecord.COUNT_TOTAL] ?: 0L)
                    put("activeCaloriesKcal", Math.round(activeCalories))
                    put("totalCaloriesKcal", Math.round(totalCalories))
                    put("distanceMeters", Math.round(aggregate[DistanceRecord.DISTANCE_TOTAL]?.inMeters ?: 0.0))
                    put("exerciseCount", sessions.size)
                    put("extraWaterMl", extraWaterMl)
                    put("sessions", sessionArray)
                })
            } catch (error: Exception) {
                call.reject("Could not read Health Connect data", error)
            }
        }
    }

    private fun client(): HealthConnectClient = HealthConnectClient.getOrCreate(context)

    private fun openHealthConnectInstallPage() {
        val packageName = "com.google.android.apps.healthdata"
        val marketIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("market://details?id=$packageName")
            setPackage("com.android.vending")
        }
        val fallbackIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("https://play.google.com/store/apps/details?id=$packageName")
        }

        try {
            activity.startActivity(marketIntent)
        } catch (_: Exception) {
            activity.startActivity(fallbackIntent)
        }
    }

    private fun calculateExtraWater(activeCalories: Double): Int {
        val estimated = activeCalories * 1.25
        val rounded = Math.round(estimated / 50.0).toInt() * 50
        return rounded.coerceIn(0, 1000)
    }

    private fun exerciseTypeLabel(type: Int): String = when (type) {
        ExerciseSessionRecord.EXERCISE_TYPE_RUNNING -> "Running"
        ExerciseSessionRecord.EXERCISE_TYPE_WALKING -> "Walking"
        ExerciseSessionRecord.EXERCISE_TYPE_BIKING -> "Cycling"
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER,
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL -> "Swimming"
        ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING -> "Strength training"
        else -> "Exercise"
    }
}
