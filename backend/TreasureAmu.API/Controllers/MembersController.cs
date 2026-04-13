using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TreasureAmu.API.Models;
using TreasureAmu.API.Services;

namespace TreasureAmu.API.Controllers;

/// <summary>
/// Handles member and newsletter signups from the TreasureAmu Angular frontend.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MembersController : ControllerBase
{
    private readonly IMemberService _memberService;
    private readonly ILogger<MembersController> _logger;

    public MembersController(IMemberService memberService, ILogger<MembersController> logger)
    {
        _memberService = memberService;
        _logger        = logger;
    }

    /// <summary>
    /// POST /api/members/signup
    /// Registers a new member or newsletter subscriber.
    /// </summary>
    [HttpPost("signup")]
    [EnableRateLimiting("signup")]
    [ProducesResponseType(typeof(SignupResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(SignupResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(SignupResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Signup(
        [FromBody] SignupRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault() ?? "Invalid request.";

            return BadRequest(new SignupResponse
            {
                Success = false,
                Message = errors,
            });
        }

        try
        {
            var member = await _memberService.SignupAsync(request, ct);
            var typeLabel = member.SignupType == SignupType.Newsletter ? "newsletter" : "membership";

            return StatusCode(StatusCodes.Status201Created, new SignupResponse
            {
                Success  = true,
                MemberId = member.Id.ToString(),
                Message  = $"Welcome! Your {typeLabel} request has been received. " +
                            "Amy will be in touch soon with next steps.",
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
        {
            return Conflict(new SignupResponse
            {
                Success = false,
                Message = "This email address is already registered with TreasureAmu.",
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Signup failed for email: {Email}", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new SignupResponse
            {
                Success = false,
                Message = "An unexpected error occurred. Please try again later.",
            });
        }
    }

    /// <summary>
    /// GET /api/members/health
    /// Simple health check endpoint.
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health() =>
        Ok(new { status = "ok" });
}
