package mai.challenge.correspondence.config.client

import org.springframework.stereotype.Service

@Service
class MailClientStub : MailClient {
    override fun sendMail(to: String, subject: String?, body: String) {
        // Stub implementation: do nothing
    }
}