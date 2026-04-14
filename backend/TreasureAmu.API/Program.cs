using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using TreasureAmu.API.Data;
using TreasureAmu.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ────────────────────────────────────────────────────────────
builder.Services.Configure<SupabaseConfig>(
    builder.Configuration.GetSection(SupabaseConfig.SectionName));

// ── HTTP Client (Supabase REST) ───────────────────────────────────────────────
builder.Services.AddHttpClient("Supabase");

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IMemberService, MemberService>();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title       = "TreasureAmu API",
        Version     = "v1",
        Description = "Backend API for the TreasureAmu neighborhood listing community platform.",
        Contact     = new() { Name = "Amy Cox", Email = "Amy@geekamu.com" },
    });
});

// ── CORS ──────────────────────────────────────────────────────────────────────
// Restrict to known origins, specific HTTP methods, and required headers only.
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .WithMethods("GET", "POST", "OPTIONS")
            .WithHeaders("Content-Type", "Authorization");
    });
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Limit signup to 5 attempts per minute per IP to prevent abuse/flooding.
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("signup", limiterOptions =>
    {
        limiterOptions.PermitLimit         = 5;
        limiterOptions.Window              = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit          = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── HSTS (production only — not useful over plain HTTP in dev) ────────────────
if (!app.Environment.IsDevelopment())
    app.UseHsts();

// ── Security Headers ──────────────────────────────────────────────────────────
// Applied first so every response — including CORS preflights, rate-limit
// rejections, and redirects — carries these headers.
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers.Append("X-Content-Type-Options", "nosniff");
    // X-Frame-Options is kept for older browsers; CSP frame-ancestors is the modern equivalent.
    headers.Append("X-Frame-Options", "DENY");
    headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Disable legacy XSS auditor — it is removed in modern browsers and enabling
    // it in older ones can introduce reflection-based XSS vectors.
    headers.Append("X-XSS-Protection", "0");
    // CSP for a JSON-only API: deny rendering and framing by any browser that
    // mistakenly tries to display the response as a page.
    headers.Append("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    await next();
});

// ── CORS must precede UseHttpsRedirection ─────────────────────────────────────
// Browsers send CORS preflight OPTIONS requests over whatever scheme the
// frontend used. If UseHttpsRedirection runs first it returns a 307 before
// CORS headers are added; browsers do not follow redirects for preflights and
// report a CORS failure instead of a redirect. By placing UseCors here,
// preflights are handled and responded to before any redirect logic runs.
app.UseCors();
app.UseRateLimiter();

app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TreasureAmu API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseAuthorization();
app.MapControllers();

// Redirect root to swagger in development
if (app.Environment.IsDevelopment())
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
