package expo.modules.ethiosmsreader

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import androidx.core.content.ContextCompat
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class EthioSmsReaderModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("EthioSmsReader")

    AsyncFunction("listInboxMessages") { maxCount: Int ->
      if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
        throw SecurityException("READ_SMS permission has not been granted.")
      }

      readInboxMessages(maxCount.coerceIn(1, 1000))
    }
  }

  private fun readInboxMessages(maxCount: Int): List<SmsMessageRecord> {
    val uri = Uri.parse("content://sms/inbox")
    val projection = arrayOf("_id", "address", "body", "date", "read")
    val messages = mutableListOf<SmsMessageRecord>()

    context.contentResolver.query(uri, projection, null, null, "date DESC")?.use { cursor ->
      val idIndex = cursor.getColumnIndex("_id")
      val addressIndex = cursor.getColumnIndex("address")
      val bodyIndex = cursor.getColumnIndex("body")
      val dateIndex = cursor.getColumnIndex("date")
      val readIndex = cursor.getColumnIndex("read")

      while (cursor.moveToNext() && messages.size < maxCount) {
        messages.add(
          SmsMessageRecord(
            id = if (idIndex >= 0) cursor.getString(idIndex) else "${messages.size}",
            address = if (addressIndex >= 0) cursor.getString(addressIndex) else null,
            body = if (bodyIndex >= 0) cursor.getString(bodyIndex) else null,
            date = if (dateIndex >= 0) cursor.getLong(dateIndex) else 0L,
            read = if (readIndex >= 0) cursor.getInt(readIndex) else 0
          )
        )
      }
    }

    return messages
  }
}
