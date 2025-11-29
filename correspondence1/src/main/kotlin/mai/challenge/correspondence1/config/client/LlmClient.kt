package mai.challenge.correspondence.config.client

import mai.challenge.correspondence.entity.DraftStyle

interface LlmClient {
    fun generateDraft(letterBody: String?, style: DraftStyle): String = "a"
}
