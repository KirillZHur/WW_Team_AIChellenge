package mai.challenge.correspondence.config.client


interface MailClient {
    fun sendMail(to: String, subject: String?, body: String)
}