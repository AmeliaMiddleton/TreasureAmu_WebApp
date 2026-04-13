using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TreasureAmu.API.Models;

/// <summary>
/// Incoming signup payload from the Angular frontend.
/// </summary>
public class SignupRequest
{
    [Required]
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("memberType")]
    public string MemberType { get; set; } = "personal";

    [Required]
    [JsonPropertyName("signupType")]
    public string SignupType { get; set; } = "member";

    [Required]
    [RegularExpression(@"^\d{5}(-\d{4})?$", ErrorMessage = "ZIP code must be 5 or 9 digits.")]
    [JsonPropertyName("zipCode")]
    public string ZipCode { get; set; } = string.Empty;
}

/// <summary>
/// Response returned to the Angular frontend after signup.
/// </summary>
public class SignupResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("memberId")]
    public string? MemberId { get; set; }
}
