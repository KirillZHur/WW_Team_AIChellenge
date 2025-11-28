import org.openapitools.generator.gradle.plugin.tasks.GenerateTask

plugins {
    kotlin("jvm") version "2.2.21"
    kotlin("plugin.spring") version "2.2.21"
    id("org.springframework.boot") version "3.5.5"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "2.1.20"
    id("org.openapi.generator") version "7.14.0"
}

group = "mai.challenge"
version = "0.0.1-SNAPSHOT"
description = "correspondence"
val jjwtVersion = "0.12.5"
val openApiVersion = "2.2.36"

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

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.liquibase:liquibase-core")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("io.swagger.core.v3:swagger-annotations:${openApiVersion}")
    implementation("io.jsonwebtoken:jjwt-api:${jjwtVersion}")
    implementation("io.jsonwebtoken:jjwt-impl:${jjwtVersion}")
    implementation("io.jsonwebtoken:jjwt-jackson:${jjwtVersion}")
    compileOnly("org.projectlombok:lombok")
    runtimeOnly("io.micrometer:micrometer-registry-prometheus")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
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
