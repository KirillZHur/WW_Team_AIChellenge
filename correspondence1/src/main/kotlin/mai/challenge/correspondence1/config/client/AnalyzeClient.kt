package mai.challenge.correspondence.config.client

import mai.challenge.correspondence.client.AnalyzePdfRequest
import mai.challenge.correspondence.client.AnalyzePdfResponse
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@FeignClient(
    name = "neuralPdfClient",
    url = "\${neural.base-url}"
)
interface AnalyzeClient {

    @PostMapping("/analyze")
    fun analyze(@RequestBody request: AnalyzePdfRequest): AnalyzePdfResponse
}