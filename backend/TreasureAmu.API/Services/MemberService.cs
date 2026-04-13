using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TreasureAmu.API.Data;
using TreasureAmu.API.Models;

namespace TreasureAmu.API.Services;

/// <summary>
/// Handles member persistence via the Supabase REST API.
/// Uses HttpClient directly for fine-grained control and to avoid
/// requiring the Supabase SDK's session/auth overhead for server-side use.
/// </summary>
public class MemberService : IMemberService
{
    private readonly HttpClient _http;
    private readonly SupabaseConfig _config;
    private readonly ILogger<MemberService> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        WriteIndented = false,
    };

    public MemberService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseConfig> config,
        ILogger<MemberService> logger)
    {
        _http   = httpClientFactory.CreateClient("Supabase");
        _config = config.Value;
        _logger = logger;
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
    {
        var url = $"{_config.Url}/rest/v1/members?email=eq.{Uri.EscapeDataString(email)}&select=id&limit=1";
        var request = BuildRequest(HttpMethod.Get, url);
        var response = await _http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetArrayLength() > 0;
    }

    public async Task<Member> SignupAsync(SignupRequest dto, CancellationToken ct = default)
    {
        // Duplicate-email guard
        if (await EmailExistsAsync(dto.Email, ct))
            throw new InvalidOperationException("An account with this email already exists.");

        // Map DTO → entity
        var member = new Member
        {
            Id         = Guid.NewGuid(),
            FirstName  = dto.FirstName.Trim(),
            LastName   = dto.LastName.Trim(),
            Email      = dto.Email.Trim().ToLowerInvariant(),
            MemberType = Enum.TryParse<MemberType>(dto.MemberType, true, out var mt) ? mt : MemberType.Personal,
            SignupType = Enum.TryParse<SignupType>(dto.SignupType, true, out var st) ? st : SignupType.Member,
            ZipCode    = dto.ZipCode.Trim(),
            IsActive   = true,
            CreatedAt  = DateTime.UtcNow,
        };

        // Build the Supabase insert payload (snake_case to match DB columns)
        var payload = new
        {
            id          = member.Id,
            first_name  = member.FirstName,
            last_name   = member.LastName,
            email       = member.Email,
            member_type = member.MemberType.ToString().ToLower(),
            signup_type = member.SignupType.ToString().ToLower(),
            zip_code    = member.ZipCode,
            is_active   = member.IsActive,
            created_at  = member.CreatedAt,
        };

        var url = $"{_config.Url}/rest/v1/members";
        var request = BuildRequest(HttpMethod.Post, url);
        request.Content = JsonContent.Create(payload, options: JsonOpts);
        request.Headers.Add("Prefer", "return=minimal");

        var response = await _http.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("Supabase insert failed [{Status}]: {Body}", response.StatusCode, body);
            throw new HttpRequestException($"Database insert failed: {response.StatusCode}");
        }

        _logger.LogInformation("New member created: {Email} ({SignupType})", member.Email, member.SignupType);
        return member;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private HttpRequestMessage BuildRequest(HttpMethod method, string url)
    {
        var req = new HttpRequestMessage(method, url);
        req.Headers.Add("apikey", _config.ServiceRoleKey);
        req.Headers.Add("Authorization", $"Bearer {_config.ServiceRoleKey}");
        return req;
    }
}
