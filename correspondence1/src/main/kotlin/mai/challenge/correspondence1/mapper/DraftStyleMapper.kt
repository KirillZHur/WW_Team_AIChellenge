package mai.challenge.correspondence.mapper

import mai.challenge.correspondence.entity.DraftStyle

object  DraftStyleMapper {
    fun fromApi(value: String): DraftStyle =
        when (value.uppercase()) {
            "OFFICIAL_REGULATOR" -> DraftStyle.OFFICIAL_REGULATOR
            "CORPORATE"          -> DraftStyle.FORMAL_BUSINESS
            "CLIENT"             -> DraftStyle.CLIENT_FRIENDLY
            "SHORT_INFO"         -> DraftStyle.SHORT_REPLY
            else -> throw IllegalArgumentException("Unknown style: $value")
        }

    fun toApi(style: DraftStyle): String =
        when (style) {
            DraftStyle.OFFICIAL_REGULATOR -> "OFFICIAL_REGULATOR"
            DraftStyle.FORMAL_BUSINESS    -> "CORPORATE"
            DraftStyle.CLIENT_FRIENDLY    -> "CLIENT"
            DraftStyle.SHORT_REPLY        -> "SHORT_INFO"
        }
}