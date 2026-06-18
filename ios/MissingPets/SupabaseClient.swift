import Foundation
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? "https://placeholder.supabase.co")!,
    supabaseKey: ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? "placeholder"
)
