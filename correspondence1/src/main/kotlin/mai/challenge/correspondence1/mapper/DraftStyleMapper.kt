package mai.challenge.correspondence.mapper

import mai.challenge.correspondence.entity.DraftStyle

object DraftStyleMapper {
    fun fromApi(value: String): DraftStyle =
        when (value.lowercase()) {
            "official" -> DraftStyle.OFFICIAL_REGULATOR
            "corporate" -> DraftStyle.FORMAL_BUSINESS
            "client" -> DraftStyle.CLIENT_FRIENDLY
            else -> DraftStyle.SHORT_REPLY
        }

    fun toApi(style: DraftStyle): String =
        when (style) {
            DraftStyle.OFFICIAL_REGULATOR -> "OFFICIAL_REGULATOR"
            DraftStyle.FORMAL_BUSINESS -> "CORPORATE"
            DraftStyle.CLIENT_FRIENDLY -> "CLIENT"
            DraftStyle.SHORT_REPLY -> "SHORT_INFO"
        }
}