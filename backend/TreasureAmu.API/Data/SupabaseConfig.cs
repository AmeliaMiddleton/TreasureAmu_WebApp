namespace TreasureAmu.API.Data;

/// <summary>
/// Supabase connection settings.
/// Values are loaded from appsettings.json / environment variables.
///
/// Required appsettings.json structure:
/// {
///   "Supabase": {
///     "Url": "https://YOUR_PROJECT_ID.supabase.co",
///     "AnonKey": "YOUR_ANON_KEY",
///     "ServiceRoleKey": "YOUR_SERVICE_ROLE_KEY"
///   }
/// }
///
/// For local development, use dotnet user-secrets:
///   dotnet user-secrets set "Supabase:ServiceRoleKey" "your-key"
/// </summary>
public class SupabaseConfig
{
    public const string SectionName = "Supabase";

    public string Url { get; set; } = string.Empty;
    public string AnonKey { get; set; } = string.Empty;

    /// <summary>
    /// Service role key — NEVER expose this to the client.
    /// Used server-side only to bypass Row Level Security for admin writes.
    /// </summary>
    public string ServiceRoleKey { get; set; } = string.Empty;
}
