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

app.UseHttpsRedirection();

// ── Security Headers ──────────────────────────────────────────────────────────
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers.Append("X-Content-Type-Options", "nosniff");
    headers.Append("X-Frame-Options", "DENY");
    headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Disable legacy XSS filter — modern browsers ignore it; enabling it can introduce XSS vectors.
    headers.Append("X-XSS-Protection", "0");
    await next();
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TreasureAmu API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors();
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllers();

// Redirect root to swagger in development
if (app.Environment.IsDevelopment())
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
