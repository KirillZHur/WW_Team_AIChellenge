package mai.challenge.correspondence.util

import org.apache.tika.Tika
import org.springframework.web.multipart.MultipartFile

object FileTextExtractor {
    private val tika = Tika()

    fun extract(file: MultipartFile): String {
        return tika.parseToString(file.inputStream)
            .trim()
            .ifBlank { "[empty file]" }
    }
}
