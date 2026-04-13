using TreasureAmu.API.Models;

namespace TreasureAmu.API.Services;

public interface IMemberService
{
    /// <summary>
    /// Creates a new member or newsletter subscriber.
    /// Throws InvalidOperationException if email already exists.
    /// </summary>
    Task<Member> SignupAsync(SignupRequest request, CancellationToken ct = default);

    /// <summary>
    /// Checks whether an email address is already registered.
    /// </summary>
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
}
