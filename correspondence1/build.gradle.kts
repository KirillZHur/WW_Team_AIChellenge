import org.openapitools.generator.gradle.plugin.tasks.GenerateTask

plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.2.3"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "1.9.25"
    id("org.openapi.generator") version "7.14.0"
}

group = "mai.challenge"
version = "0.0.1-SNAPSHOT"
description = "correspondence"

val jjwtVersion = "0.12.5"
val openApiVersion = "2.2.36"
val tinkaVersion = "2.9.2"
val cloudVersion = "2023.0.3"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${cloudVersion}")
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.liquibase:liquibase-core")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.cloud:spring-cloud-starter-openfeign")
    implementation("org.apache.tika:tika-core:${tinkaVersion}")
    implementation("org.apache.tika:tika-parsers-standard-package:${tinkaVersion}")
    implementation("io.swagger.core.v3:swagger-annotations:${openApiVersion}")
    implementation("io.jsonwebtoken:jjwt-api:${jjwtVersion}")
    implementation("io.jsonwebtoken:jjwt-impl:${jjwtVersion}")
    implementation("io.jsonwebtoken:jjwt-jackson:${jjwtVersion}")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    runtimeOnly("org.postgresql:postgresql")

}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

sourceSets {
    main {
        kotlin.srcDirs("src/main/kotlin", "${layout.buildDirectory.get().asFile}/generated/src/main/kotlin")
    }
}


val specs = listOf(
    "correspondence" to "correspondence/swagger.yaml"
)

specs.forEach { (name, path) -> generateOpenApiSpec(name, path) }

fun generateOpenApiSpec(specName: String, specPath: String) {
    val taskName = "openApiGenerate_$specName"
    tasks.register<GenerateTask>(taskName) {
        group = "openapi tools"
        description = "Generates code from OpenAPI spec for $specName"
        generatorName = "kotlin-spring"
        inputSpec = "$rootDir/src/main/resources/swagger/$specPath".replace("\\", "/") // для винды сделал реплейс, без него не работает
        outputDir = ("${layout.buildDirectory.get().asFile}/generated")

        apiPackage = "$specName.api"
        modelPackage = "$specName.model"

        configOptions =
            mapOf(
                "interfaceOnly" to "true",
                "skipDefaultInterface" to "true",
                "useSpringBoot3" to "true",
                "useTags" to "true",
            )

        globalProperties = mapOf(
            "apis" to "",
            "models" to ""
        )
    }
    tasks.compileKotlin.get().dependsOn(taskName)
}
