using System.ComponentModel.DataAnnotations;

namespace TreasureAmu.API.Models;

public enum MemberType
{
    Personal,
    Business,
    Nonprofit
}

public enum SignupType
{
    Member,
    Newsletter
}

/// <summary>
/// Represents a TreasureAmu member or newsletter subscriber stored in Supabase.
/// </summary>
public class Member
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    public MemberType MemberType { get; set; } = MemberType.Personal;

    public SignupType SignupType { get; set; } = SignupType.Member;

    [Required, MaxLength(10)]
    public string ZipCode { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
