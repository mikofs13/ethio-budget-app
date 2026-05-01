package expo.modules.ethiosmsreader

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

data class SmsMessageRecord(
  @Field
  val id: String,

  @Field
  val address: String?,

  @Field
  val body: String?,

  @Field
  val date: Long,

  @Field
  val read: Int
) : Record
