plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidLibrary)
}

// ponytail: no network, no ktor. The content is compiled in from data.js via scripts/gen.mjs.
kotlin {
    jvm()
    androidTarget()
    sourceSets {
        commonTest.dependencies { implementation(kotlin("test")) }
    }
}

android {
    namespace = "com.nulljosh.fieldbook.shared"
    compileSdk = 36
    defaultConfig { minSdk = 26 }
}
