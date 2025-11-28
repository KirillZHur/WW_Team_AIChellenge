package mai.challenge.correspondence.config.client

import mai.challenge.correspondence.entity.DraftStyle
import org.springframework.stereotype.Service

@Service
class LlmClientStub : LlmClient {
    override fun generateDraft(letterBody: String?, style: DraftStyle): String {
        return "This is a generated draft based on the provided letter body and style."
    }
}